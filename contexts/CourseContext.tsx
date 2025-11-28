import React from 'react';
import { Course } from '../types';

export interface CourseContextType {
  courses: Course[];
  enrolledCourseIds: string[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  enrollCourse: (courseId: string) => void;
}

export const CourseContext = React.createContext<CourseContextType>({
  courses: [],
  enrolledCourseIds: [],
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  enrollCourse: () => {},
});

