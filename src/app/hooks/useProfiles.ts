"use client";

import { useState, useEffect } from "react";
import type { Profile } from "../types";

export function useProfiles() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    loadProfiles().catch(console.error);
  }, []);

  useEffect(() => {
    if (currentProfile) {
      saveProfileToStorage(currentProfile.id);
    }
  }, [currentProfile]);

  async function loadProfiles() {
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Profiles response is not an array:", data);
        setProfiles([]);
        return;
      }

      setProfiles(data);

      const savedProfileId = localStorage.getItem("selectedProfileId");
      if (savedProfileId) {
        const profile = data.find((p: Profile) => p.id === savedProfileId);
        if (profile) {
          setCurrentProfile(profile);
        } else if (data.length > 0) {
          setCurrentProfile(data[0]);
        }
      } else if (data.length > 0) {
        setCurrentProfile(data[0]);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
      setProfiles([]);
    }
  }

  const saveProfileToStorage = (profileId: string) => {
    try {
      localStorage.setItem("selectedProfileId", profileId);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  async function createProfile(username: string) {
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const newProfile = await res.json();
      setProfiles(prev => [...prev, newProfile]);
      setCurrentProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  async function updateProfile(profileId: string, updates: Partial<Profile>) {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedProfile = await res.json();

      setProfiles(prev => prev.map(p => p.id === profileId ? updatedProfile : p));
      if (currentProfile?.id === profileId) {
        setCurrentProfile(updatedProfile);
      }

      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function deleteProfile(profileId: string, password: string) {
    if (profiles.length <= 1) {
      throw new Error("Du kannst nicht das letzte Profil löschen!");
    }

    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      const newProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(newProfiles);

      if (currentProfile?.id === profileId) {
        setCurrentProfile(newProfiles[0] ?? null);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  }

  return {
    currentProfile,
    setCurrentProfile,
    profiles,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  };
}
