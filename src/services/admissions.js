import api from "@/lib/axios";
export const getQualifiedStudents = async () => {
    const response = await api.get('/admissions/qualified-students');
    return response.data;
};
export const getSchools = async () => {
    const response = await api.get('/admissions/schools');
    return response.data;
};
export const assignSchool = async (studentId, schoolId, classId) => {
    const response = await api.post(`/admissions/assign`, {
        studentId,
        schoolId,
        classId
    });
    return response.data;
};
export const getEnrolledStudents = async () => {
    const response = await api.get('/admissions/enrolled');
    return response.data;
};
