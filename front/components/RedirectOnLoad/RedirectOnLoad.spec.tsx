import '../../testSetup';

import { shallow } from 'enzyme';
import * as React from 'react';

// Mock the state context before we import RedirectOnLoad. We'll be able to mutate the
// context object to vary it for every test
const context = { state: '', video: {} };
jest.doMock('../App/App', () => {
  return {
    AppDataContext: {
      Consumer: (props: any) => props.children(context),
    },
  };
});

import { videoState } from '../../types/Video';
import { ROUTE as DASHBOARD_ROUTE } from '../Dashboard/Dashboard';
import { ROUTE as ERROR_ROUTE } from '../ErrorComponent/ErrorComponent';
import { ROUTE as FORM_ROUTE } from '../VideoForm/VideoForm';
import { ROUTE as PLAYER_ROUTE } from '../VideoPlayer/VideoPlayer';
import { RedirectOnLoad } from './RedirectOnLoad';

describe('<RedirectOnLoad />', () => {
  it('redirects to the error view on LTI error', () => {
    context.state = 'error';
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(ERROR_ROUTE('lti'));
  });

  it('redirects instructors to the player when the video is ready', () => {
    context.state = 'instructor';
    context.video = { state: videoState.READY };
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(PLAYER_ROUTE());
  });

  it('redirects students to /player when the video is ready', () => {
    context.state = 'student';
    context.video = { state: videoState.READY };
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(PLAYER_ROUTE());
  });

  it('redirects instructors to /form when there is no video yet', () => {
    context.state = 'instructor';
    context.video = { state: videoState.PENDING };
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(FORM_ROUTE());
  });

  it('redirects instructors to /dashboard when there is a video undergoing processing', () => {
    context.state = 'instructor';
    context.video = { state: videoState.PROCESSING };
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(DASHBOARD_ROUTE());
  });

  it('redirects students to the error view when the video is not ready', () => {
    context.state = 'student';
    context.video = { state: 'not_ready' };
    const wrapper = shallow(<RedirectOnLoad />).dive();

    expect(wrapper.name()).toEqual('Redirect');
    expect(wrapper.prop('push')).toBeTruthy();
    expect(wrapper.prop('to')).toEqual(ERROR_ROUTE('notFound'));
  });
});
