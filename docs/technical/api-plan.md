# Dating App API Endpoint Plan

**Base URL**: `https://datn.chessy.dev`

Legend:

- `[CORE]` = Core foundation (Phase 1/2) built first
- Phase 1 = Core foundation
- Phase 2 = Core dating flow
- Phase 3 = Advanced / production features

---

# Phase 1 -- Foundation (Auth + User + Basic Infra)

## Auth

- `[CORE] POST /api/auth/register` -- Huy
- `[CORE] POST /api/auth/login` -- Danh
- `[CORE] POST /api/auth/refresh-token` -- Danh
- `[CORE] POST /api/auth/logout` -- Danh
- `POST /api/auth/verify-email` -- Huy
- `POST /api/auth/resend-verification` -- Huy
- `POST /api/auth/forgot-password` -- Huy
- `POST /api/auth/reset-password`-- Huy
- `[CORE] PATCH /api/auth/change-password` -- Huy
- `DELETE /api/auth/delete-account`-- Huy

## OAuth

- `GET /api/auth/oauth/google`-- Danh
- `GET /api/auth/oauth/google/callback`-- Danh
- `POST /api/auth/oauth/login`-- Danh

## User Profile

- `[CORE] GET /api/users/me`-- Huy
- `[CORE] PATCH /api/users/me/profile`-- Huy
- `PATCH /api/users/me/preferences`-- Huy
- `PATCH /api/users/me/location`-- Huy
- `PATCH /api/users/me/bio`-- Huy

## Photos

- `[CORE] POST /api/users/photos`
- `DELETE /api/users/photos/{photoId}`
- `PATCH /api/users/photos/reorder`

    ## Verification

- `POST /api/verification/face`
- `POST /api/verification/phone`
- `POST /api/verification/id`
- `GET /api/verification/status`

## System

- `[CORE] GET /api/system/health`
- `GET /api/system/metrics`

---

# Phase 2 -- Dating Core (Discovery + Swipe + Match + Chat)

## Discovery / Recommendation

- `[CORE] GET /api/discovery/recommendations`
- `[CORE] POST /api/discovery/refresh`
- `GET /api/discovery/users/{userId}`

## Swipe

- `[CORE] POST /api/swipes/like`
- `[CORE] POST /api/swipes/pass`
- `POST /api/swipes/undo`

## Match

- `[CORE] GET /api/matches`
- `GET /api/matches/{matchId}`
- `DELETE /api/matches/{matchId}`

## Chat

- `[CORE] GET /api/chat/conversations`
- `[CORE] GET /api/chat/messages/{matchId}`
- `[CORE] POST /api/chat/messages`
- `DELETE /api/chat/messages/{messageId}`

## Call

- `POST /api/calls/start`
- `POST /api/calls/accept`
- `POST /api/calls/reject`
- `POST /api/calls/end`

## Date Plan (advanced dating feature)

- `POST /api/date-plans`
- `GET /api/date-plans`
- `POST /api/date-plans/{id}/accept`
- `POST /api/date-plans/{id}/decline`
- `DELETE /api/date-plans/{id}`

---

# Phase 3 -- Safety / Fraud / Moderation / Analytics

## Flag System

- `POST /api/flags/users`
- `POST /api/flags/messages`
- `POST /api/flags/photos`
- `GET /api/flags/me`
- `DELETE /api/admin/flags/{flagId}`
- `GET /api/admin/flags/users`

## Safety

- `POST /api/safety/safe-mode`
- `POST /api/safety/share-location`
- `POST /api/safety/emergency`
- `POST /api/safety/date-checkin`

## Trust Score

- `GET /api/trust/me`
- `GET /api/trust/{userId}`
- `POST /api/admin/trust/recalculate/{userId}`

## Reports / Blocks

- `POST /api/reports/users`
- `POST /api/users/block`
- `DELETE /api/users/block/{userId}`
- `GET /api/users/blocked`

## Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`
- `POST /api/notifications/enable`
- `POST /api/notifications/disable`
- `PATCH /api/notifications/settings`

## Activity

- `GET /api/activity/me`
- `GET /api/activity/swipes`
- `GET /api/activity/matches`
- `GET /api/activity/logins`

## Fraud Monitoring

- `GET /api/admin/fraud/suspicious`
- `GET /api/admin/fraud/logs`
- `POST /api/admin/fraud/flag/{userId}`

## Admin Moderation

- `GET /api/admin/users`
- `GET /api/admin/users/{userId}`
- `POST /api/admin/users/{userId}/ban`
- `POST /api/admin/users/{userId}/unban`
- `POST /api/admin/users/{userId}/shadow-ban`
- `POST /api/admin/users/{userId}/suspend`
- `POST /api/admin/users/{userId}/restore`
- `POST /api/admin/users/{userId}/force-logout`

## Reports Admin

- `GET /api/admin/reports`
- `POST /api/admin/reports/{id}/resolve`

## Analytics

- `GET /api/admin/analytics/users`
- `GET /api/admin/analytics/dau`
- `GET /api/admin/analytics/matches`
- `GET /api/admin/analytics/reports`

## System Maintenance

- `POST /api/admin/system/recommendation-cache/clear`
- `POST /api/admin/system/reindex`
- `POST /api/admin/system/ml-refresh`
