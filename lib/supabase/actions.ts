// Forwarding layer from legacy supabase actions to Cloudflare D1 actions
import { getCampuses, createCampusAction, updateCampusAction, deleteCampusAction } from "@/lib/actions/campuses";
import { getCourses, createCourseAction, updateCourseAction, deleteCourseAction, getBulletins, createBulletinAction, deleteBulletinAction } from "@/lib/actions/classes";
import { getAdmissions, updateAdmissionStatusAction, deleteAdmissionAction, submitPublicAdmissionAction } from "@/lib/actions/admissions";
import { getClubs, createClubAction, updateClubAction, deleteClubAction } from "@/lib/actions/clubs";
import { getYearbook, createYearbookAction, updateYearbookAction, deleteYearbookAction } from "@/lib/actions/yearbook";
import { getUsers, deleteUserAction } from "@/lib/actions/users";
import { getServerSession } from "@/lib/auth/rbac";

export async function getCurrentUserProfile() {
  const { user } = await getServerSession();
  return user;
}

export const fetchCampuses = getCampuses;
export const createCampus = createCampusAction;
export const updateCampus = updateCampusAction;
export const deleteCampus = deleteCampusAction;

export const fetchCourses = getCourses;
export const createCourse = createCourseAction;
export const updateCourse = updateCourseAction;
export const deleteCourse = deleteCourseAction;

export const fetchBulletins = getBulletins;
export const createBulletin = createBulletinAction;
export const deleteBulletin = deleteBulletinAction;

export const fetchAdmissions = getAdmissions;
export const createAdmission = submitPublicAdmissionAction;
export const updateAdmission = updateAdmissionStatusAction;
export const deleteAdmission = deleteAdmissionAction;

export const fetchClubs = getClubs;
export const createClub = createClubAction;
export const updateClub = updateClubAction;
export const deleteClub = deleteClubAction;

export const fetchYearbook = getYearbook;
export const createYearbookEntry = createYearbookAction;
export const updateYearbookEntry = updateYearbookAction;
export const deleteYearbookEntry = deleteYearbookAction;

export const fetchUsers = getUsers;
export const deleteUser = deleteUserAction;
