/**
 * useIntelligence.js
 * Custom hook that orchestrates all data fetching for the Intelligence Center.
 * Fetches: students, analytics overview, department analytics, subject analytics,
 * top performers, marks distribution, and ML risk predictions for all students.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useIntelligenceData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlError, setMlError] = useState(null);

  const [students, setStudents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [deptAnalytics, setDeptAnalytics] = useState([]);
  const [subjectAnalytics, setSubjectAnalytics] = useState([]);
  const [topPerformers, setTopPerformers] = useState(null);
  const [marksDistribution, setMarksDistribution] = useState([]);
  const [riskData, setRiskData] = useState([]); // [{student, prediction}]
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskProgress, setRiskProgress] = useState(0);

  const fetchBaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stuRes, overviewRes, deptRes, subRes, topRes, marksDistRes] = await Promise.all([
        api.getStudents(),
        api.getAnalyticsOverview(),
        api.getDepartmentAnalytics(),
        api.getSubjectAnalytics(),
        api.getTopPerformers(10),
        api.getMarksDistribution(),
      ]);

      if (stuRes.success) setStudents(stuRes.data);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (deptRes.success) setDeptAnalytics(deptRes.data);
      if (subRes.success) setSubjectAnalytics(subRes.data);
      if (topRes.success) setTopPerformers(topRes.data);
      if (marksDistRes.success) setMarksDistribution(marksDistRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRiskPredictions = useCallback(async (studentList) => {
    if (!studentList || studentList.length === 0) return;
    setRiskLoading(true);
    setMlError(null);
    setRiskProgress(0);

    const results = [];
    let evaluated = 0;

    // Batch risk predictions in groups of 5 for performance
    const batchSize = 5;
    for (let i = 0; i < studentList.length; i += batchSize) {
      const batch = studentList.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((s) => api.getRiskPrediction(s.student_id))
      );
      batchResults.forEach((r, idx) => {
        const student = batch[idx];
        if (r.status === 'fulfilled' && r.value?.success) {
          results.push({ student, prediction: r.value.prediction });
        } else if (r.status === 'fulfilled' && r.value?.prediction) {
          results.push({ student, prediction: r.value.prediction });
        }
        // If rejected, ML service is down — record without prediction
      });
      evaluated += batch.length;
      setRiskProgress(Math.round((evaluated / studentList.length) * 100));
    }

    if (results.length === 0) {
      setMlError('ML inference service is unavailable. Risk predictions cannot be loaded.');
    }

    setRiskData(results);
    setRiskLoading(false);
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  useEffect(() => {
    if (students.length > 0) {
      fetchRiskPredictions(students);
    }
  }, [students, fetchRiskPredictions]);

  const refresh = useCallback(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  // Compute derived risk metrics from ML results
  const riskMetrics = (() => {
    const withPrediction = riskData.filter(
      (d) => d.prediction?.status === 'success'
    );
    const high = withPrediction.filter((d) => d.prediction?.risk_category === 'HIGH').length;
    const medium = withPrediction.filter((d) => d.prediction?.risk_category === 'MEDIUM').length;
    const low = withPrediction.filter((d) => d.prediction?.risk_category === 'LOW').length;
    return { evaluated: withPrediction.length, high, medium, low };
  })();

  return {
    loading,
    error,
    mlError,
    students,
    overview,
    deptAnalytics,
    subjectAnalytics,
    topPerformers,
    marksDistribution,
    riskData,
    riskLoading,
    riskProgress,
    riskMetrics,
    refresh,
    fetchRiskPredictions,
  };
}
