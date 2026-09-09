"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "quantumLearningProgress";

export default function ProgressSync() {
  useEffect(() => {
    const supabase = createClient();

    let userId: string | null = null;
    let lastSavedProgress = "";

    async function syncProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      userId = user.id;

      // Check if this student already has cloud progress
      const { data, error } = await supabase
        .from("student_progress")
        .select("learning_progress")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Could not load cloud progress:", error);
        return;
      }

      // If cloud progress exists, use it
      if (data?.learning_progress) {
        const cloudProgress = JSON.stringify(data.learning_progress);

        localStorage.setItem(STORAGE_KEY, cloudProgress);
        lastSavedProgress = cloudProgress;

        return;
      }

      // If this is the student's first cloud sync,
      // migrate their existing browser progress
      const localProgress = localStorage.getItem(STORAGE_KEY);

      if (localProgress) {
        const parsedProgress = JSON.parse(localProgress);

        const { error: saveError } = await supabase
          .from("student_progress")
          .upsert(
            {
              user_id: user.id,
              completed_algorithms:
                parsedProgress.completedAlgorithms || [],
              learning_progress: parsedProgress,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            }
          );

        if (saveError) {
          console.error(
            "Could not migrate progress:",
            saveError
          );
        } else {
          lastSavedProgress = localProgress;
        }
      }
    }

    async function watchProgress() {
      if (!userId) return;

      const currentProgress =
        localStorage.getItem(STORAGE_KEY);

      if (!currentProgress) return;

      if (currentProgress === lastSavedProgress) {
        return;
      }

      try {
        const parsedProgress = JSON.parse(currentProgress);

        const { error } = await supabase
          .from("student_progress")
          .upsert(
            {
              user_id: userId,
              completed_algorithms:
                parsedProgress.completedAlgorithms || [],
              learning_progress: parsedProgress,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            }
          );

        if (error) {
          console.error(
            "Could not sync progress:",
            error
          );
          return;
        }

        lastSavedProgress = currentProgress;
      } catch (error) {
        console.error(
          "Invalid learning progress:",
          error
        );
      }
    }

    syncProgress();

    const interval = setInterval(watchProgress, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}