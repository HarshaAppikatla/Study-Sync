import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TranscriptUploadModal from '../TranscriptUploadModal';
import api from '../../../services/api';

describe('TranscriptUploadModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userId: 1,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal inputs correctly when open', () => {
    render(<TranscriptUploadModal {...defaultProps} />);

    expect(screen.getByText(/Apply as Verified Mentor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. CSE2001/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Transcript/i)).toBeInTheDocument();
  });

  it('handles clean PDF upload successfully', async () => {
    api.post.mockResolvedValueOnce({
      data: 'Transcript submitted successfully for verification.',
    });

    render(<TranscriptUploadModal {...defaultProps} />);

    // Fill form
    const courseInput = screen.getByPlaceholderText(/e.g. CSE2001/i);
    await userEvent.type(courseInput, 'CSE2001');

    // Upload clean PDF file
    const file = new File(['%PDF-1.4 clean content'], 'transcript.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Official Transcript \(PDF\)/i) || document.querySelector('input[type="file"]');
    
    await userEvent.upload(fileInput, file);

    // Submit form
    const submitBtn = screen.getByText(/Submit Transcript/i);
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/v1/mentorship/verify',
        expect.any(FormData),
        expect.any(Object)
      );
      expect(screen.getByText(/Transcript submitted successfully/i)).toBeInTheDocument();
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('displays red tamper alert when API flags Canva/Photoshop metadata anomalies', async () => {
    api.post.mockResolvedValueOnce({
      data: 'Upload flagged for admin review due to metadata anomalies.',
    });

    render(<TranscriptUploadModal {...defaultProps} />);

    // Fill form
    const courseInput = screen.getByPlaceholderText(/e.g. CSE2001/i);
    await userEvent.type(courseInput, 'CSE2001');

    // Upload tampered PDF file
    const file = new File(['%PDF-1.4 Canva edited'], 'tampered_transcript.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);

    // Submit form
    const submitBtn = screen.getByText(/Submit Transcript/i);
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Security Alert/i)).toBeInTheDocument();
    });
  });
});
