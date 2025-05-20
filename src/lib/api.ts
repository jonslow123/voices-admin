import axios from 'axios';
import Cookies from 'js-cookie';

// Fix the API URL to avoid double slashes
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.voicesradio.co.uk';
// Set a reasonable timeout for API requests
const API_TIMEOUT = 10000; // 10 seconds

// Helper function to ensure URLs don't have double slashes
const cleanUrl = (base, path) => {
  // Remove trailing slash from base and leading slash from path
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// Create an api instance for auth endpoints
const authApi = axios.create({
  baseURL: cleanUrl(BASE_API_URL, '/auth'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Create a separate api instance for other endpoints
const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Add auth token to each request if it exists
const addAuthToken = (config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(token);
  return config;
};

// Apply interceptors to both API instances
authApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
api.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Auth API functions
export const login = async (email: string, password: string) => {
  try {
    // Log the exact URL being used
    const loginUrl = cleanUrl(BASE_API_URL, '/auth/login');
    console.log('Login request to URL:', loginUrl);
    
    const response = await authApi.post('/login', { email, password });
    console.log('Login successful, response:', response.data);
    
    // Save the token to cookies
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token);
    }
    
    // Store user data
    if (response.data.user) {
      Cookies.set('user_data', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      
      if (!error.response) {
        throw new Error('Network error: Could not connect to the server. Please check your internet connection and try again.');
      }
      
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    }
    
    throw error;
  }
};

export const logout = () => {
  Cookies.remove('auth_token');
  Cookies.remove('user_data');
};

// Artists API
export const getArtists = async () => {
  try {
    console.log('Fetching artists from:', `/artists`);
    const response = await api.get('/artists');
    return response.data;
  } catch (error) {
    console.error('Error fetching artists:', error);
    throw error;
  }
};

export const getArtistById = async (id: string) => {
  const response = await api.get(`/artists/${id}`);
  return response.data;
};

export const createArtist = async (artistData: any) => {
  console.log('Creating artist with data:', artistData);
  try {
    const response = await api.post('/artists/', artistData);
    return response.data;
  } catch (error) {
    // Check if it's an Axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      const { data, status } = error.response;
      
      // Handle specific error cases
      if (status === 400 && data?.message?.includes('already exists')) {
        throw new Error(`Artist with name "${artistData.name}" already exists.`);
      }
      
      // General error with message from API
      if (data?.message) {
        throw new Error(data.message);
      }
    }
    
    // Default error handling
    console.error('API error details:', error);
    throw new Error('Failed to create artist. Please try again.');
  }
};

export const updateArtist = async (id: string, artistData: any) => {
  console.log('Updating artist:', id, artistData);
  const response = await api.put(`/artists/${id}`, artistData);
  return response.data;
};

export const addShowToArtist = async (artistId: string, showData: any) => {
  const response = await api.post(`/artists/${artistId}/shows`, showData);
  return response.data;
};

export const updateShow = async (artistId: string, showId: string, showData: any) => {
  const response = await api.put(`/artists/${artistId}/shows/${showId}`, showData);
  return response.data;
};

export const deleteShow = async (artistId: string, showId: string) => {
  try {
    console.log('Deleting show:', { artistId, showId });
    const response = await api.delete(`/artists/${artistId}/shows/${showId}`);
    console.log('Delete show response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteShow:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        throw new Error(error.response.data?.message || `Failed to delete show: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response received from server');
      }
    }
    throw error;
  }
};

export const deleteArtist = async (id: string) => {
  const response = await api.delete(`/artists/${id}`);
  return response.data;
};

// Extract Mixcloud key from URL
export const extractMixcloudKey = (url) => {
  if (!url) return null;
  // Remove trailing slash if present
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  // Extract the path after mixcloud.com
  const match = cleanUrl.match(/mixcloud\.com(\/[^\/]+\/[^\/]+)/i);
  return match ? match[1] : null;
};

// Fetch show data from Mixcloud
export const fetchMixcloudShowData = async (mixcloudUrl) => {
  try {
    const key = extractMixcloudKey(mixcloudUrl);
    if (!key) throw new Error('Invalid Mixcloud URL');
    
    const response = await fetch(`https://api.mixcloud.com${key}`);
    const data = await response.json();
    
    // Format the date as YYYY-MM-DD for HTML date input
    let formattedDate = new Date().toISOString().split('T')[0]; // Default to today
    
    if (data.created_time) {
      try {
        const date = new Date(data.created_time);
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } catch (err) {
        console.warn('Error parsing Mixcloud date:', err);
      }
    }
    
    return {
      title: data.name,
      description: data.description || '',
      date: formattedDate,
      duration: data.audio_length,
      mixcloudUrl,
      mixcloudKey: key,
      imageUrl: data.pictures?.extra_large || data.pictures?.large || data.pictures?.medium || '',
    };
  } catch (error) {
    console.error('Error fetching from Mixcloud API:', error);
    throw error;
  }
};

// Extract SoundCloud track ID from URL
export const extractSoundCloudId = (url: string): string | null => {
  if (!url) return null;
  
  // Try to extract ID from URL format
  const regex = /soundcloud\.com\/[^\/]+\/([^\/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Fetch show data from SoundCloud
export const fetchSoundCloudShowData = async (soundcloudUrl: string) => {
  try {
    // First, get an access token using client credentials
    const CLIENT_ID = 'NNLc87xjDYAgHuz8qGUNDAD2oX5rn47K';
    const CLIENT_SECRET = 'DvbA0e1MsoWCBkc0aU2Ssjo1ssFNVKkd';
    
    const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('Failed to get SoundCloud access token');
    }
    
    console.log('Got SoundCloud access token:', accessToken);
    
    // Resolve the track URL to get the track ID
    const resolveResponse = await fetch(
      `https://api.soundcloud.com/resolve?url=${encodeURIComponent(soundcloudUrl)}`,
      {
        headers: {
          'Authorization': `OAuth ${accessToken}`
        }
      }
    );
    
    if (!resolveResponse.ok) {
      const errorText = await resolveResponse.text();
      console.error('SoundCloud API error:', resolveResponse.status, errorText);
      throw new Error(`SoundCloud API error: ${resolveResponse.status}`);
    }
    
    const trackData = await resolveResponse.json();
    console.log('SoundCloud track data:', trackData);
    
    // Parse the SoundCloud date format "YYYY/MM/DD HH:MM:SS +0000"
    let formattedDate = new Date().toISOString().split('T')[0]; // Default to today
    
    if (trackData.created_at) {
      try {
        // Parse the SoundCloud date format
        const dateMatch = trackData.created_at.match(/(\d{4})\/(\d{2})\/(\d{2})/);
        if (dateMatch) {
          const [_, year, month, day] = dateMatch;
          // Format as YYYY-MM-DD for HTML date input
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch (err) {
        console.warn('Error parsing SoundCloud date:', err);
      }
    }
    
    // Get the highest quality artwork URL
    let imageUrl = '';
    if (trackData.artwork_url) {
      // Replace -large with -t500x500 for higher resolution
      imageUrl = trackData.artwork_url.replace('-large', '-t500x500');
    } else if (trackData.user && trackData.user.avatar_url) {
      // Replace -large with -t500x500 for user avatar as well
      imageUrl = trackData.user.avatar_url.replace('-large', '-t500x500');
    }
    
    return {
      title: trackData.title || '',
      description: trackData.description || '',
      date: formattedDate,
      duration: Math.floor((trackData.duration || 0) / 1000), // Convert from milliseconds to seconds
      soundcloudUrl: soundcloudUrl,
      soundcloudId: trackData.id ? trackData.id.toString() : '',
      imageUrl: imageUrl || '', // Use our optimized high-res URL
    };
  } catch (error) {
    console.error('Error fetching from SoundCloud API:', error);
    throw error;
  }
};

// Fetch artist data from SoundCloud
export const fetchSoundCloudArtistData = async (soundcloudUrl: string) => {
  try {
    // First, get an access token using client credentials
    const CLIENT_ID = 'NNLc87xjDYAgHuz8qGUNDAD2oX5rn47K';
    const CLIENT_SECRET = 'DvbA0e1MsoWCBkc0aU2Ssjo1ssFNVKkd';
    
    const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('Failed to get SoundCloud access token');
    }
    
    console.log('Got SoundCloud access token:', accessToken);
    
    // Resolve the user URL to get the user data
    const resolveResponse = await fetch(
      `https://api.soundcloud.com/resolve?url=${encodeURIComponent(soundcloudUrl)}`,
      {
        headers: {
          'Authorization': `OAuth ${accessToken}`
        }
      }
    );
    
    if (!resolveResponse.ok) {
      const errorText = await resolveResponse.text();
      console.error('SoundCloud API error:', resolveResponse.status, errorText);
      throw new Error(`SoundCloud API error: ${resolveResponse.status}`);
    }
    
    const userData = await resolveResponse.json();
    console.log('SoundCloud user data:', userData);
    
    // Extract username from URL
    const username = soundcloudUrl.split('/').pop() || '';
    
    // Try to get the latest tracks to extract genres
    let genres = [];
    try {
      const tracksResponse = await fetch(
        `https://api.soundcloud.com/users/${userData.id}/tracks?limit=5`,
        {
          headers: {
            'Authorization': `OAuth ${accessToken}`
          }
        }
      );
      
      if (tracksResponse.ok) {
        const tracks = await tracksResponse.json();
        
        // Extract genres from tracks
        const allGenres = tracks
          .map(track => track.genre)
          .filter(genre => genre && genre.trim() !== '')
          .concat(
            // Also try to extract genres from tags
            tracks
              .flatMap(track => (track.tag_list || '').split(' '))
              .filter(tag => tag && tag.trim() !== '')
          );
        
        // Get unique genres
        genres = [...new Set(allGenres)].slice(0, 3);
      }
    } catch (err) {
      console.warn('Error fetching tracks for genres:', err);
    }
    
    // Get high-resolution profile image
    let profileImageUrl = '';
    if (userData.avatar_url) {
      // Replace -large with -t500x500 for higher resolution
      profileImageUrl = userData.avatar_url.replace('-large', '-t500x500');
    }
    
    return {
      name: userData.username || '',
      bio: userData.description || '',
      profileImageUrl: profileImageUrl || '',
      soundcloudUsername: username,
      primaryGenres: genres,
    };
  } catch (error) {
    console.error('Error fetching artist from SoundCloud:', error);
    throw error;
  }
};

export default api; 