export interface StreakInfo {
  streak: number;
  lastLoginDate: string;
  currentDate: string;
  streakUpdated: boolean;
}

class StreakService {
  /**
   * Update user streak when they log in or visit the app
   */
  async updateStreak(getAuth?: () => Promise<{ Authorization?: string | undefined }>): Promise<StreakInfo | null> {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Get auth headers if available
      const authHeader = getAuth ? await getAuth() : {};
      
      const response = await fetch(`${API_BASE_URL}/users/updateStreak`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update streak:', errorText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }

  /**
   * Get the current streak information without updating it
   */
  async getStreakInfo(getAuth?: () => Promise<{ Authorization?: string | undefined }>): Promise<StreakInfo | null> {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Get auth headers if available
      const authHeader = getAuth ? await getAuth() : {};
      
      const response = await fetch(`${API_BASE_URL}/users/streakInfo`, {
        credentials: 'include',
        headers: authHeader
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get streak info:', errorText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting streak info:', error);
      return null;
    }
  }
}

export const streakService = new StreakService();
export default streakService;