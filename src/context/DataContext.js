// src/context/DataContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/AuthContext';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const { user, token } = useAuth();

    // Create API hooks at the top level (not inside another function)
    const studentsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/students` : null);
    const staffsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/staffs` : null);
    const subjectsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/subjects` : null);
    const resultsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/results` : null);
    const pendingResultsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/pendingResults` : null);
    const certificationResultsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/certificationResults` : null);
    const feeRecordsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/feeRecords` : null);
    const calendarEventsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/calendarEvents` : null);
    const syllabusEntriesData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/syllabusEntries` : null);
    const digitalLibraryData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/digitalLibrary` : null);
    const usersData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/users` : null);
    const adminMessagesData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/adminMessages` : null);
    const certificationRegistrationsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/certificationRegistrations` : null);
    const attendanceRecordsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/attendance` : null);
    const timetablesData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/timetables` : null);
    const notificationsData = useApi(user ? `${process.env.REACT_APP_BACKEND_URL}/api/notifications` : null);

    // Combine all data into a single state object
    const [data, setData] = useState({
        students: [],
        staffs: [],
        subjects: [],
        results: [],
        pendingResults: [],
        certificationResults: [],
        feeRecords: [],
        calendarEvents: [],
        syllabusEntries: [],
        digitalLibrary: [],
        users: [],
        adminMessages: [],
        certificationRegistrations: [],
        attendanceRecords: [],
        timetables: [],
        notifications: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoized setter functions
    const createSetter = useCallback((key) => (newData) => {
        setData(prev => ({ ...prev, [key]: newData }));
    }, []);

    // Effect to update the combined data state only when user is authenticated
    useEffect(() => {
        // If no user is authenticated, set empty data
        if (!user) {
            setData({
                students: [],
                staffs: [],
                subjects: [],
                results: [],
                pendingResults: [],
                certificationResults: [],
                feeRecords: [],
                calendarEvents: [],
                syllabusEntries: [],
                digitalLibrary: [],
                users: [],
                adminMessages: [],
                certificationRegistrations: [],
                attendanceRecords: [],
                timetables: [],
                notifications: []
            });
            setLoading(false);
            setError('User not authenticated');
            return;
        }

        // Check if any API is still loading
        const allDataHooks = [
            studentsData, staffsData, subjectsData, resultsData, pendingResultsData,
            certificationResultsData, feeRecordsData, calendarEventsData,
            syllabusEntriesData, digitalLibraryData, usersData, adminMessagesData,
            certificationRegistrationsData, attendanceRecordsData, timetablesData,
            notificationsData
        ];

        const allLoading = allDataHooks.some(dataHook => dataHook.loading);
        const anyError = allDataHooks.find(dataHook => dataHook.error);

        setLoading(allLoading);
        setError(anyError ? anyError.message : null);

        // Only update data if we have an authenticated user
        if (user && token) {
            setData(prev => {
                const newData = {
                    students: studentsData.data || [],
                    staffs: staffsData.data || [],
                    subjects: subjectsData.data || [],
                    results: resultsData.data || [],
                    pendingResults: pendingResultsData.data || [],
                    certificationResults: certificationResultsData.data || [],
                    feeRecords: feeRecordsData.data || [],
                    calendarEvents: calendarEventsData.data || [],
                    syllabusEntries: syllabusEntriesData.data || [],
                    digitalLibrary: digitalLibraryData.data || [],
                    users: usersData.data || [],
                    adminMessages: adminMessagesData.data || [],
                    certificationRegistrations: certificationRegistrationsData.data || [],
                    attendanceRecords: attendanceRecordsData.data || [],
                    timetables: timetablesData.data || [],
                    notifications: notificationsData.data || []
                };

                // Only update if data actually changed
                return JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData;
            });
        }
    }, [
        user,
        token,
        studentsData.data, studentsData.loading, studentsData.error,
        staffsData.data, staffsData.loading, staffsData.error,
        subjectsData.data, subjectsData.loading, subjectsData.error,
        resultsData.data, resultsData.loading, resultsData.error,
        pendingResultsData.data, pendingResultsData.loading, pendingResultsData.error,
        certificationResultsData.data, certificationResultsData.loading, certificationResultsData.error,
        feeRecordsData.data, feeRecordsData.loading, feeRecordsData.error,
        calendarEventsData.data, calendarEventsData.loading, calendarEventsData.error,
        syllabusEntriesData.data, syllabusEntriesData.loading, syllabusEntriesData.error,
        digitalLibraryData.data, digitalLibraryData.loading, digitalLibraryData.error,
        usersData.data, usersData.loading, usersData.error,
        adminMessagesData.data, adminMessagesData.loading, adminMessagesData.error,
        certificationRegistrationsData.data, certificationRegistrationsData.loading, certificationRegistrationsData.error,
        attendanceRecordsData.data, attendanceRecordsData.loading, attendanceRecordsData.error,
        timetablesData.data, timetablesData.loading, timetablesData.error,
        notificationsData.data, notificationsData.loading, notificationsData.error
    ]);

    // Function to refetch all data
    const refetchAll = useCallback(() => {
        if (!user) return;

        // Call refetch on each data hook if available
        if (studentsData.refetch) studentsData.refetch();
        if (staffsData.refetch) staffsData.refetch();
        if (subjectsData.refetch) subjectsData.refetch();
        if (resultsData.refetch) resultsData.refetch();
        if (pendingResultsData.refetch) pendingResultsData.refetch();
        if (certificationResultsData.refetch) certificationResultsData.refetch();
        if (feeRecordsData.refetch) feeRecordsData.refetch();
        if (calendarEventsData.refetch) calendarEventsData.refetch();
        if (syllabusEntriesData.refetch) syllabusEntriesData.refetch();
        if (digitalLibraryData.refetch) digitalLibraryData.refetch();
        if (usersData.refetch) usersData.refetch();
        if (adminMessagesData.refetch) adminMessagesData.refetch();
        if (certificationRegistrationsData.refetch) certificationRegistrationsData.refetch();
        if (attendanceRecordsData.refetch) attendanceRecordsData.refetch();
        if (timetablesData.refetch) timetablesData.refetch();
        if (notificationsData.refetch) notificationsData.refetch();
    }, [user, 
        studentsData.refetch, staffsData.refetch, subjectsData.refetch,
        resultsData.refetch, pendingResultsData.refetch, certificationResultsData.refetch,
        feeRecordsData.refetch, calendarEventsData.refetch, syllabusEntriesData.refetch,
        digitalLibraryData.refetch, usersData.refetch, adminMessagesData.refetch,
        certificationRegistrationsData.refetch, attendanceRecordsData.refetch,
        timetablesData.refetch, notificationsData.refetch
    ]);

    // Provide the combined data and loading state through the context
    const value = {
        ...data,
        loading,
        error,
        refetchAll,
        // Include setter functions for updating data
        setStudents: createSetter('students'),
        setStaffs: createSetter('staffs'),
        setSubjects: createSetter('subjects'),
        setResults: createSetter('results'),
        setPendingResults: createSetter('pendingResults'),
        setCertificationResults: createSetter('certificationResults'),
        setFeeRecords: createSetter('feeRecords'),
        setCalendarEvents: createSetter('calendarEvents'),
        setSyllabusEntries: createSetter('syllabusEntries'),
        setDigitalLibrary: createSetter('digitalLibrary'),
        setUsers: createSetter('users'),
        setAdminMessages: createSetter('adminMessages'),
        setCertificationRegistrations: createSetter('certificationRegistrations'),
        setAttendanceRecords: createSetter('attendanceRecords'),
        setTimetables: createSetter('timetables'),
        setNotifications: createSetter('notifications')
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};