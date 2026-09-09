import { createClient } from "@/lib/supabase/client";

export type LearningProgress = {
  completedAlgorithms: string[];
  tutorUsed: boolean;
  labUsed: boolean;
  gatesExplored: string[];
  simulationsRun: number;
  lastGate: string;
  xp: number;
  quizzesCompleted: number;
  bb84QuizCompleted: boolean;
  bb84QuizScore: number;
  bb84QuizAttempts: number;
};

export const defaultLearningProgress: LearningProgress = {
  completedAlgorithms: [],
  tutorUsed: false,
  labUsed: false,
  gatesExplored: [],
  simulationsRun: 0,
  lastGate: "",
  xp: 0,
  quizzesCompleted: 0,
  bb84QuizCompleted: false,
  bb84QuizScore: 0,
  bb84QuizAttempts: 0,
};

export async function loadProgress(): Promise<LearningProgress> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return defaultLearningProgress;
  }

  const { data, error } = await supabase
    .from("student_progress")
    .select("learning_progress, completed_algorithms")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Could not load student progress:", error);
    return defaultLearningProgress;
  }

  if (!data) {
    return defaultLearningProgress;
  }

  return {
    ...defaultLearningProgress,
    ...(data.learning_progress || {}),
    completedAlgorithms:
      data.completed_algorithms ||
      data.learning_progress?.completedAlgorithms ||
      [],
  };
}

export async function saveProgress(
  progress: LearningProgress
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Cannot save progress: user is not logged in.");
    return false;
  }

  const { error } = await supabase
    .from("student_progress")
    .upsert(
      {
        user_id: user.id,
        completed_algorithms: progress.completedAlgorithms,
        learning_progress: progress,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Could not save student progress:", error);
    return false;
  }

  return true;
}
export async function updateProgress(
  updates: Partial<LearningProgress>
): Promise<boolean> {
  const currentProgress = await loadProgress();

  const updatedProgress: LearningProgress = {
    ...currentProgress,
    ...updates,
  };

  return saveProgress(updatedProgress);
}