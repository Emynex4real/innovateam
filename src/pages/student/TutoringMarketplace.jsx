import React, { useState, useEffect } from 'react';
import CollaborationService from '../../services/collaborationService';
import './TutoringMarketplace.css';

/**
 * Tutoring Marketplace Page
 * Browse tutors and request tutoring services
 */
const TutoringMarketplace = ({ centerId, userId }) => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    subject: '',
    topic: '',
    description: '',
    preferredStartDate: '',
    estimatedHours: 1,
  });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, [centerId]);

  useEffect(() => {
    if (selectedSubject) {
      setFilteredTutors(
        tutors.filter((tutor) => tutor.subjects.includes(selectedSubject))
      );
    } else {
      setFilteredTutors(tutors);
    }
  }, [selectedSubject, tutors]);

  const fetchTutors = async () => {
    setLoading(true);
    const result = await CollaborationService.getTutors(centerId);
    if (result.success) {
      setTutors(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRequestTutoring = async () => {
    if (
      !requestData.subject.trim() ||
      !requestData.description.trim() ||
      !requestData.preferredStartDate
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setRequesting(true);
    const result = await CollaborationService.requestTutoring(
      selectedTutor.id,
      requestData.subject,
      requestData.topic,
      requestData.description,
      requestData.preferredStartDate,
      [],
      requestData.estimatedHours
    );

    if (result.success) {
      setShowRequestModal(false);
      setRequestData({
        subject: '',
        topic: '',
        description: '',
        preferredStartDate: '',
        estimatedHours: 1,
      });
      setError(null);
      alert('Tutoring request sent successfully!');
    } else {
      setError(result.error);
    }
    setRequesting(false);
  };

  const getSubjects = () => {
    const subjects = new Set();
    tutors.forEach((tutor) => {
      tutor.subjects.forEach((subject) => subjects.add(subject));
    });
    return Array.from(subjects).sort();
  };

  return (
    <div className="tutoring-page">
      <div className="tutoring-header">
        <h1>Find a Tutor</h1>
        <p>Get personalized help from experienced tutors</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tutoring-filters">
        <div className="filter-group">
          <label>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            <option value="">All Subjects</option>
            {getSubjects().map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tutors...</div>
      ) : filteredTutors.length === 0 ? (
        <div className="empty-state">
          <p>No tutors available</p>
        </div>
      ) : (
        <div className="tutors-grid">
          {filteredTutors.map((tutor) => (
            <div key={tutor.id} className="tutor-card">
              <div className="tutor-header">
                <div className="tutor-avatar">
                  {tutor.avatar ? (
                    <img src={tutor.avatar} alt={tutor.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {tutor.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="tutor-title-area">
                  <h3>{tutor.name}</h3>
                  <div className="tutor-rating">
                    ⭐ {tutor.rating || 'N/A'} ({tutor.review_count || 0} reviews)
                  </div>
                </div>
              </div>

              <div className="tutor-info">
                {tutor.bio && (
                  <p className="tutor-bio">{tutor.bio}</p>
                )}

                <div className="tutor-meta">
                  <div className="meta-item">
                    <span className="meta-label">Rate</span>
                    <span className="meta-value">
                      ${(tutor.hourly_rate / 100).toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Experience</span>
                    <span className="meta-value">
                      {tutor.experience_years || '?'} yrs
                    </span>
                  </div>
                </div>

                <div className="subjects-list">
                  {tutor.subjects.map((subject) => (
                    <span key={subject} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="tutor-actions">
                <button
                  className="secondary-btn"
                  onClick={() => setSelectedTutor(tutor)}
                >
                  View Profile
                </button>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setShowRequestModal(true);
                  }}
                >
                  Request Tutor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRequestModal && selectedTutor && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Tutoring from {selectedTutor.name}</h2>

            <div className="form-group">
              <label>Subject *</label>
              <select
                value={requestData.subject}
                onChange={(e) =>
                  setRequestData({ ...requestData, subject: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select Subject</option>
                {selectedTutor.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                placeholder="Specific topic or chapter"
                value={requestData.topic}
                onChange={(e) =>
                  setRequestData({ ...requestData, topic: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="What do you need help with?"
                value={requestData.description}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    description: e.target.value,
                  })
                }
                className="input-field"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preferred Start Date *</label>
                <input
                  type="date"
                  value={requestData.preferredStartDate}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      preferredStartDate: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={requestData.estimatedHours}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      estimatedHours: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="estimated-cost">
              <span>Estimated Cost:</span>
              <span className="cost-value">
                ${(
                  (selectedTutor.hourly_rate / 100) *
                  requestData.estimatedHours
                ).toFixed(2)}
              </span>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-btn"
                onClick={() => setShowRequestModal(false)}
                disabled={requesting}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleRequestTutoring}
                disabled={requesting}
              >
                {requesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutoringMarketplace;
