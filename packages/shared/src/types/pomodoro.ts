/**
 * Pomodoro session type
 */
export type PomodoroType = 'work' | 'short_break' | 'long_break';

export type PomodoroStatus = 'running' | 'paused' | 'completed';

export interface Pomodoro {
  pomodoro_id: number;
  user_id: number;
  type: PomodoroType;
  planned_duration: number;
  actual_duration: number | null;
  start_time: Date;
  end_time: Date | null;
  status: PomodoroStatus;
  position_in_cycle: number | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO for creating pomodoro session
 */
export interface CreatePomodoroDto {
  type: PomodoroType;
  planned_duration: number;
  position_in_cycle?: number;
}

/**
 * DTO for updating pomodoro session
 */
export interface UpdatePomodoroDto {
  status?: PomodoroStatus;
  actual_duration?: number;
  end_time?: Date;
}
