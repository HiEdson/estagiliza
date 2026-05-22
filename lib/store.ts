"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  area: string;
  level: string;
  skills: string[];
  languages: string[];
  experience: string;
  rawCvText?: string;
  cvFileName?: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "estágio" | "emprego" | "remoto";
  url: string;
  urlValid?: boolean;
  description: string;
  requirements: string[];
  compatibilityScore: number;
  postedDate?: string;
  salary?: string;
  applicationEmail?: string;
  source: string;
}

interface EstagilizaStore {
  profile: UserProfile | null;
  jobs: JobListing[];
  selectedJob: JobListing | null;
  isSearching: boolean;
  searchQuery: string;
  coverLetter: string;
  cvFileBase64: string; // in-memory base64 PDF
  cvFileName: string;   // in-memory PDF filename
  setProfile: (profile: UserProfile) => void;
  setJobs: (jobs: JobListing[]) => void;
  setSelectedJob: (job: JobListing | null) => void;
  setIsSearching: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setCoverLetter: (letter: string) => void;
  setCvFile: (base64: string, name: string) => void;
  clearCvFile: () => void;
  clearAll: () => void;
}

export const useStore = create<EstagilizaStore>()(
  persist(
    (set) => ({
      profile: null,
      jobs: [],
      selectedJob: null,
      isSearching: false,
      searchQuery: "",
      coverLetter: "",
      cvFileBase64: "",
      cvFileName: "",
      setProfile: (profile) => set({ profile }),
      setJobs: (jobs) => set({ jobs }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      setIsSearching: (v) => set({ isSearching: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setCoverLetter: (letter) => set({ coverLetter: letter }),
      setCvFile: (base64, name) => set({ cvFileBase64: base64, cvFileName: name }),
      clearCvFile: () => set({ cvFileBase64: "", cvFileName: "" }),
      clearAll: () =>
        set({
          profile: null,
          jobs: [],
          selectedJob: null,
          coverLetter: "",
          cvFileBase64: "",
          cvFileName: "",
        }),
    }),
    {
      name: "estagiliza-store",
      partialize: (state) => ({
        profile: state.profile,
        jobs: state.jobs,
        selectedJob: state.selectedJob,
        coverLetter: state.coverLetter,
      }),
    }
  )
);
