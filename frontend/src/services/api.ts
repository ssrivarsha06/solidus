// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  merkleRoot?: any;
  digitalId?(digitalId: any): unknown;
  transactionId?: any;
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // User registration with blockchain integration
  async registerUser(userData: any, files?: { biometricPhoto?: File; documents?: File[] }): Promise<ApiResponse<{ digitalId: string; merkleRoot: string }>> {
    const formData = new FormData();
    formData.append('userData', JSON.stringify(userData));

    if (files?.biometricPhoto) {
      formData.append('biometricPhoto', files.biometricPhoto);
    }

    if (files?.documents) {
      files.documents.forEach((file) => {
        formData.append('documents', file);
      });
    }

    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  // Verify identity with zero-knowledge proof
  async verifyIdentity(digitalId: string, proof: string[], leafData: string): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.request('/verify-identity', {
      method: 'POST',
      body: JSON.stringify({ digitalId, proof, leafData }),
    });
  }

  // NGO authentication
  async ngoLogin(credentials: { organizationName: string; email: string; password: string }): Promise<ApiResponse<{ sessionId: string; organizationName: string }>> {
    return this.request('/ngo/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Allocate aid (NGO only)
  async allocateAid(allocation: {
    sessionId: string;
    beneficiaryId: string;
    amount: number;
    category: string;
  }): Promise<ApiResponse<{ transactionId: string }>> {
    return this.request('/ngo/allocate-aid', {
      method: 'POST',
      body: JSON.stringify(allocation),
    });
  }

  // Get user profile
  async getUserProfile(digitalId: string): Promise<ApiResponse<{ user: any }>> {
    return this.request(`/user/${digitalId}`);
  }

  // Get user transactions
  async getUserTransactions(digitalId: string): Promise<ApiResponse<{ transactions: any[] }>> {
    return this.request(`/user/${digitalId}/transactions`);
  }

  // Get all beneficiaries (NGO only)
  async getBeneficiaries(): Promise<ApiResponse<{ beneficiaries: any[] }>> {
    return this.request('/ngo/beneficiaries');
  }

  // Get transparency data
  async getTransparencyData(): Promise<ApiResponse<{
    totalBeneficiaries: number;
    totalAidDistributed: number;
    categoryBreakdown: Record<string, number>;
    recentTransactions: any[];
    blockchainEnabled: boolean;
  }>> {
    return this.request('/transparency');
  }
}

export const apiService = new ApiService();

// -------------------- React hook --------------------
import { useState, useEffect } from 'react';

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();

        if (mounted) {
          if (response.success) {
            setData(response.data || response);
          } else {
            setError(response.message || 'API call failed');
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Network error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => apiCall() };
}

// -------------------- Blockchain utilities --------------------
export class BlockchainUtils {
  static generateMerkleProof(data: any[], targetIndex: number): string[] {
    const hashes = data.map(item => this.hash(JSON.stringify(item)));
    return this.getMerkleProof(hashes, targetIndex);
  }

  private static hash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private static getMerkleProof(hashes: string[], targetIndex: number): string[] {
    const proof: string[] = [];
    let currentLevel = hashes;
    let currentIndex = targetIndex;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

        if (i === currentIndex || i === currentIndex - 1) {
          const sibling = i === currentIndex ? right : left;
          proof.push(sibling);
        }

        nextLevel.push(this.hash(left + right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }
}
