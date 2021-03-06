import { fireEvent, render } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { ImportMock } from 'ts-mock-imports';

import { DashboardVideoPaneTranscriptOption } from '.';
import * as useTimedTextTrackModule from '../../data/stores/useTimedTextTrack';
import { timedTextMode, uploadState } from '../../types/tracks';
import { Deferred } from '../../utils/tests/Deferred';
import { videoMockFactory } from '../../utils/tests/factories';
import { wrapInIntlProvider } from '../../utils/tests/intl';

const useTimedTextTrackStub = ImportMock.mockFunction(
  useTimedTextTrackModule,
  'useTimedTextTrack',
);

jest.mock('../../data/appData', () => ({
  appData: {},
}));

describe('<DashboardVideoPaneTranscriptOption />', () => {
  afterEach(jest.resetAllMocks);

  afterAll(useTimedTextTrackStub.restore);
  const video = videoMockFactory({
    id: '443',
    timed_text_tracks: [],
    upload_state: uploadState.READY,
    should_use_subtitle_as_transcript: false,
  });

  it('renders nothing if there is no timed text track', () => {
    useTimedTextTrackStub.returns([]);

    const { container } = render(
      wrapInIntlProvider(<DashboardVideoPaneTranscriptOption video={video} />),
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if there is already at least a transcript', () => {
    useTimedTextTrackStub.returns([
      {
        id: '42',
        is_ready_to_show: true,
        language: 'fr',
        mode: timedTextMode.TRANSCRIPT,
        upload_state: uploadState.READY,
      },
    ]);

    const { container } = render(
      wrapInIntlProvider(<DashboardVideoPaneTranscriptOption video={video} />),
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if there is no subtitle', () => {
    useTimedTextTrackStub.returns([
      {
        id: '42',
        is_ready_to_show: true,
        language: 'fr',
        mode: timedTextMode.CLOSED_CAPTIONING,
        upload_state: uploadState.READY,
      },
    ]);

    const { container } = render(
      wrapInIntlProvider(<DashboardVideoPaneTranscriptOption video={video} />),
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the form if there is at least one subtitle and no transcript', () => {
    useTimedTextTrackStub.returns([
      {
        id: '42',
        is_ready_to_show: true,
        language: 'fr',
        mode: timedTextMode.SUBTITLE,
        upload_state: uploadState.READY,
      },
    ]);

    const { getByLabelText } = render(
      wrapInIntlProvider(<DashboardVideoPaneTranscriptOption video={video} />),
    );
    expect(getByLabelText('Use subtitles as transcripts')).toHaveProperty(
      'checked',
      false,
    );
  });

  it('updates the checkbox and the video record when the user clicks the checkbox', async () => {
    const deferred = new Deferred();
    fetchMock.mock('/api/videos/443/', deferred.promise, { method: 'PUT' });

    useTimedTextTrackStub.returns([
      {
        id: '42',
        is_ready_to_show: true,
        language: 'fr',
        mode: timedTextMode.SUBTITLE,
        upload_state: uploadState.READY,
      },
    ]);

    const { getByLabelText } = render(
      wrapInIntlProvider(<DashboardVideoPaneTranscriptOption video={video} />),
    );
    expect(getByLabelText('Use subtitles as transcripts')).toHaveProperty(
      'checked',
      false,
    );

    await act(async () => {
      fireEvent.click(getByLabelText('Use subtitles as transcripts'));
      return deferred.resolve({
        ...video,
        should_use_subtitle_as_transcript: true,
      });
    });

    expect(getByLabelText('Use subtitles as transcripts')).toHaveProperty(
      'checked',
      true,
    );
    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual('/api/videos/443/');
    expect(fetchMock.lastCall()![1]!.body).toEqual(
      JSON.stringify({
        ...video,
        should_use_subtitle_as_transcript: true,
      }),
    );
  });
});
