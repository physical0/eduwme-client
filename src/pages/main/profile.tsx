import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useAuth } from "@src/contexts/AuthContext";
import AvatarPlaceholder from "@src/assets/avatar_placeholder.jpg";
import LoadingPage from "@src/components/loading";

interface UserProfile {
  _id: string;
  username: string;
  nickname: string;
  biodata: string;
  xp: number;
  level: number;
  profilePicture?: string;
}

// Interface for inventory items
interface InventoryItem {
  itemId: string;
  dateAcquired: Date;
  isEquipped: boolean;
  details: {
    itemId: string;
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    category: "avatar" | "background" | "badge" | "theme" | "powerup";
    isAvailable: boolean;
  };
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNickname, setEditedNickname] = useState<string>("");
  const [editedBiodata, setEditedBiodata] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user, getAuthHeader } = useAuth();

  // State for profile picture
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for banner image
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  // State for badge image
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [badgeName, setBadgeName] = useState<string | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";


  // Check if the current user is viewing their own profile
  const isOwnProfile = user && userId === user._id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/getprofile/${userId}`,
          {
            method: "GET",
            headers: await getAuthHeader(),
            credentials: "include",
          },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Network response was not ok" }));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();

        if (data && data.user) {
          setUserProfile(data.user);
          // Initialize edit fields with current values
          setEditedNickname(data.user.nickname || "");
          setEditedBiodata(data.user.biodata || "");

          // Set preview image if user has profile picture
          if (data.user.profilePicture) {
            setPreviewImage(data.user.profilePicture);
          }

          // fetch the user's inventory for banner and badge
          fetchUserInventory(data.user._id);
        } else {
          throw new Error("User data not found in API response.");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, API_BASE_URL]);

  // Fetch user inventory to get equipped banner and badge
  const fetchUserInventory = async (userId: string) => {
    setIsLoadingInventory(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/shop/userInventory/${userId}`,
        {
          method: "GET",
          headers: await getAuthHeader(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.inventory && data.inventory.length > 0) {
        // Find equipped banner (background)
        const equippedBanner = data.inventory.find(
          (item: InventoryItem) => item.details.category === "background" && item.isEquipped
        );

        if (equippedBanner && equippedBanner.details.imageUrl) {
          setBannerImage(equippedBanner.details.imageUrl);
        }

        // Find equipped badge
        const equippedBadge = data.inventory.find(
          (item: InventoryItem) => item.details.category === "badge" && item.isEquipped
        );

        if (equippedBadge && equippedBadge.details.imageUrl) {
          setBadgeImage(equippedBadge.details.imageUrl);
          setBadgeName(equippedBadge.details.name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user inventory:", err);
      // We don't need to show this error to the user as it's not critical
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Add cleanup for object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function to revoke any object URLs when component unmounts
      if (previewImage && previewImage.startsWith('blob:') && userProfile?.profilePicture !== previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, userProfile]);

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form values
      setEditedNickname(userProfile?.nickname || "");
      setEditedBiodata(userProfile?.biodata || "");

      // Revoke previous object URL if it exists to prevent memory leaks
      if (previewImage && previewImage.startsWith('blob:') && userProfile?.profilePicture !== previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      // Reset image selection if canceled
      if (userProfile?.profilePicture) {
        setPreviewImage(userProfile.profilePicture);
      } else {
        setPreviewImage(null);
      }
      setBase64Image(null);

      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setUpdateError(null);
    }
    setIsEditing(!isEditing);
    setUpdateSuccess(false);
  };

  // Improved compressImage function with better quality and size control
  // Modify your compressImage function to recursively try lower quality settings
  const compressImage = (file: File, maxWidth = 300, quality = 0.9, attempt = 1): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // Calculate appropriate dimensions based on attempt number
          let width = img.width;
          let height = img.height;

          // Reduce dimensions more aggressively on subsequent attempts
          const currentMaxWidth = attempt > 1 ? maxWidth / attempt : maxWidth;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > currentMaxWidth) {
            height = Math.round((height * currentMaxWidth) / width);
            width = currentMaxWidth;
          }

          // Ensure minimum dimensions (but smaller on later attempts)
          const minDimension = Math.max(100, 200 / attempt);
          width = Math.max(width, minDimension);
          height = Math.max(height, minDimension);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Lower quality more aggressively with each attempt
          const finalQuality = Math.min(0.7, quality - (attempt * 0.1));

          canvas.toBlob(
            async (blob) => {
              if (blob) {
                // Check if the blob size is less than 30KB
                if (blob.size <= 30 * 1024) {
                  resolve(blob);
                } else if (attempt < 5) {
                  // Try again with more aggressive compression
                  try {
                    const smallerBlob = await compressImage(file, maxWidth, quality, attempt + 1);
                    resolve(smallerBlob);
                  } catch (err) {
                    reject(err);
                  }
                } else {
                  // Last resort: force a very small image
                  canvas.width = 200;
                  canvas.height = 200;
                  ctx?.drawImage(img, 0, 0, 200, 200);
                  canvas.toBlob(
                    (finalBlob) => {
                      if (finalBlob && finalBlob.size <= 30 * 1024) {
                        resolve(finalBlob);
                      } else {
                        reject(new Error('Unable to compress image below 30KB'));
                      }
                    },
                    'image/jpeg',
                    0.5
                  );
                }
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            finalQuality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update handleImageChange function
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUpdateError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      try {
        // Show processing message
        setUpdateError("Processing image, please wait...");

        // Revoke previous object URL if it exists
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage);
        }

        // Create a preview URL (this is just for display)
        const previewURL = URL.createObjectURL(file);
        setPreviewImage(previewURL);

        // Initial compression settings - will be adjusted automatically if needed
        const initialMaxWidth = 600;
        const initialQuality = 0.8;

        // Compress the image with size target of 30KB
        const compressedBlob = await compressImage(file, initialMaxWidth, initialQuality);
        console.log(`Original size: ${file.size / 1024}KB, Compressed size: ${compressedBlob.size / 1024}KB`);

        // Convert compressed image to base64 for sending to the server
        const base64 = await blobToBase64(compressedBlob);
        setBase64Image(base64);

        // Clear any previous errors
        setUpdateError(null);
      } catch (err) {
        console.error("Error processing image:", err);
        setUpdateError(
          err instanceof Error ? err.message : "Failed to process the image. Please try another one."
        );
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    if (isEditing && isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !isOwnProfile) return;

    setIsSaving(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Check if base64Image is too large (3MB max in base64)
      if (base64Image && base64Image.length > 3 * 1024 * 1024) {
        throw new Error("Image is too large. Please select a smaller image.");
      }

      // Prepare update data without image first
      const updateData = {
        userId: userProfile._id,
        nickname: editedNickname,
        biodata: editedBiodata,
      };

      // If we have an image, add it separately (to help with debugging)
      const dataWithImage = base64Image
        ? { ...updateData, profilePicture: base64Image }
        : updateData;

      // Log the data size being sent
      if (base64Image) {
        console.log(`Sending image data of size: ${Math.round(base64Image.length / 1024)}KB`);
      }

      const response = await fetch(`${API_BASE_URL}/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeader()),
        },
        credentials: "include",
        body: JSON.stringify(dataWithImage),
      });

      // Try to parse the response, but handle it gracefully if it fails
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error("Failed to parse response:", error);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}. The image may be too large.`);
        }
      }

      if (!response.ok) {
        throw new Error(
          (data && (data.error || data.message)) ||
          `Server error: ${response.status}. The image may be too large or in an invalid format.`
        );
      }

      // If we're here, the update was successful
      // Update the profile in state with the new data
      setUserProfile({
        ...userProfile,
        nickname: editedNickname,
        biodata: editedBiodata,
        // Only update profile picture if we actually changed it
        ...(base64Image && previewImage ? { profilePicture: previewImage } : {})
      });

      setUpdateSuccess(true);
      setIsEditing(false);

      // Reset file input after successful submission
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate XP progress to next level (assuming 100 XP per level)
  const xpPerLevel = 100;
  const xpProgress = userProfile ? (userProfile.xp % xpPerLevel) : 0;
  const xpProgressPercent = (xpProgress / xpPerLevel) * 100;

  // Loading state with responsive styling and dark mode support
  if (isLoading) {
    return <LoadingPage message="Loading profile..." fullScreen={false} />;
  }

  // Error state with responsive styling and dark mode support
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md fade-in-stagger">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error loading profile
          </h2>
          <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-6 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-xl">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not found state with responsive styling and dark mode support
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md fade-in-stagger">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find this user's profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pb-24 sm:pb-20">

        {/* Status Messages */}
        {updateSuccess && (
          <div className="mb-4 p-3 sm:p-4 rounded-xl text-sm sm:text-base font-medium shadow-lg fade-in-stagger flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
            <span className="text-xl">✅</span>
            Profile updated successfully!
          </div>
        )}

        {updateError && (
          <div className="mb-4 p-3 sm:p-4 rounded-xl text-sm sm:text-base font-medium shadow-lg fade-in-stagger flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
            <span className="text-xl">⚠️</span>
            {updateError}
          </div>
        )}

        {/* Main Profile Card */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl fade-in-stagger border-2 border-white/20 dark:border-white/10">

          {/* Banner Section */}
          <div className="relative h-20 sm:h-36 md:h-44 overflow-hidden">
            {isLoadingInventory ? (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"></div>
            ) : bannerImage ? (
              <img
                src={bannerImage}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-shift"></div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

            {/* Edit Button */}
            {isOwnProfile && (
              <button
                onClick={handleEditToggle}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm ${isEditing
                  ? "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  }`}
              >
                {isEditing ? (
                  <span className="flex items-center gap-1.5">
                    <span>✕</span> Cancel
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>✏️</span> Edit
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="relative px-4 sm:px-6 pb-5 sm:pb-6">

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-8 sm:-mt-14 md:-mt-16 mb-3 sm:mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <div
                className={`relative group ${isEditing && isOwnProfile ? 'cursor-pointer' : ''}`}
                onClick={handleImageClick}
              >
                {/* Avatar Image */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-3 sm:border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-800">
                  <img
                    src={previewImage || userProfile.profilePicture || AvatarPlaceholder}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Edit Overlay */}
                {isEditing && isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-2xl sm:text-3xl">📷</span>
                  </div>
                )}

                {/* Online Status Indicator */}
                {isOwnProfile && !isEditing && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>

              {/* Upload Button */}
              {isEditing && isOwnProfile && (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-xs sm:text-sm font-medium transition-colors"
                >
                  Change Photo
                </button>
              )}

              {/* Image Size Warning */}
              {isEditing && isOwnProfile && previewImage && base64Image && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-[200px]">
                  Images are automatically compressed to under 30KB
                </p>
              )}
            </div>

            {/* Username and Badge */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  {userProfile.username}
                </h1>

                {/* Badge */}
                {badgeImage && (
                  <div className="relative group">
                    <img
                      src={badgeImage}
                      alt={badgeName || "User Badge"}
                      className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain drop-shadow-lg"
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      {badgeName || "User Badge"}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nickname Display (when not editing) */}
              {!isEditing && userProfile.nickname && (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  "{userProfile.nickname}"
                </p>
              )}
            </div>

            {/* Stats Cards */}
            {!isEditing && (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-5">
                {/* XP Card */}
                <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-cyan-200/50 dark:border-cyan-800/50 group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <span className="text-sm sm:text-xl group-hover:scale-110 transition-transform">⭐</span>
                    <span className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">Experience</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {userProfile.xp}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">XP Points</p>
                </div>

                {/* Level Card */}
                <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-purple-200/50 dark:border-purple-800/50 group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <span className="text-sm sm:text-xl group-hover:scale-110 transition-transform">🏆</span>
                    <span className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">Level</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {userProfile.level}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">Current Level</p>
                </div>
              </div>
            )}

            {/* XP Progress Bar */}
            {!isEditing && (
              <div className="mb-3 sm:mb-5 glass-card rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/30 dark:border-white/10">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Progress to Level {userProfile.level + 1}
                  </span>
                  <span className="text-[10px] sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    {xpProgress}/{xpPerLevel} XP
                  </span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out animate-cyan-wave"
                    style={{ width: `${xpProgressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Nickname Input */}
                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={editedNickname}
                    onChange={(e) => setEditedNickname(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:text-white text-sm sm:text-base transition-all duration-300"
                    placeholder="Enter a nickname"
                  />
                </div>

                {/* Bio Input */}
                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    value={editedBiodata}
                    onChange={(e) => setEditedBiodata(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-h-[100px] sm:min-h-[120px] dark:text-white text-sm sm:text-base transition-all duration-300 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${isSaving ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>💾</span> Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Bio Display */
              <div className="glass-card rounded-xl p-4 sm:p-5 border border-white/30 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base sm:text-lg">📝</span>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">About</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {userProfile.biodata || "No bio provided yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card (optional - shows when viewing other profiles) */}
        {!isOwnProfile && !isEditing && (
          <div className="mt-4 glass-card rounded-xl p-4 text-center border border-white/20 dark:border-white/10 fade-in-stagger" style={{ animationDelay: '200ms' }}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              👋 You're viewing <span className="font-semibold text-gray-700 dark:text-gray-300">{userProfile.username}</span>'s profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;