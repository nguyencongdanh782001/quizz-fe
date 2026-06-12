import { client } from "../client";
import type {
  TrackHeartbeatRequest,
  TrackHeartbeatResponse,
  TrackPageViewRequest,
  TrackPageViewResponse,
} from "../types";

export const api = {
  analytics: {
    pageView: (data: TrackPageViewRequest) =>
      client.post<TrackPageViewResponse>("/analytics/page-view", data),
    heartbeat: (data: TrackHeartbeatRequest) =>
      client.post<TrackHeartbeatResponse>("/analytics/heartbeat", data),
  },
} as const;
