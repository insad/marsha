import { render } from '@testing-library/react';
import React from 'react';

import { liveState } from '../../types/tracks';
import { converseMounter } from '../../utils/converse';
import { videoMockFactory } from '../../utils/tests/factories';
import { Chat } from '.';

const mockVideo = videoMockFactory({
  id: '5cffe85a-1829-4000-a6ca-a45d4647dc0d',
  live_state: liveState.RUNNING,
  xmpp: {
    bosh_url: 'https://xmpp-server.com/http-bind',
    conference_url:
      '870c467b-d66e-4949-8ee5-fcf460c72e88@conference.xmpp-server.com',
    prebind_url: 'https://xmpp-server.com/http-pre-bind',
    jid: 'xmpp-server.com',
  },
});
jest.mock('../../data/appData', () => ({
  appData: {
    video: mockVideo,
  },
}));

jest.mock('../../utils/converse', () => ({
  converseMounter: jest.fn(() => jest.fn()),
}));

const mockConverseMounter = converseMounter as jest.MockedFunction<
  typeof converseMounter
>;

describe('<Chat />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the Chat component', () => {
    expect(mockConverseMounter).toHaveBeenCalled();
    render(<Chat video={mockVideo} />);

    // mockConverseMounter returns itself a mock. We want to inspect this mock to be sure that
    // is was called with the container name and the xmpp object
    expect(mockConverseMounter.mock.results[0].value).toHaveBeenCalledWith(
      '#converse-container',
      mockVideo.xmpp,
    );
  });
});
