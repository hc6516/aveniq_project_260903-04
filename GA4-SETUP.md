# AVENIQ GA4

Measurement ID: `G-LBVCLJ26EP` (public identifier; not a secret).

Only the production homepage loads GA, after explicit analytics consent. Preview/admin pages are excluded. The footer lets visitors decline or withdraw consent; withdrawal reloads the page and expires first-party GA cookies. Signup remains closed until existing legal/configuration gates are satisfied.

The explicit Next Script integration lets us redact arbitrary URL parameters and configure Google consent before loading the tag. No form values or error messages are sent. Only validated campaign values are copied to GA campaign parameters. Never use personal information in UTM codes.

## Implemented event examples

- `page_view`: consenting homepage visit.
- `launch_cta_click`: launch signup anchor clicked.
- `signup_form_start`: first change in enabled signup form.
- `signup_submit_error`: unsuccessful request, without raw error details.
- `generate_lead`: successful server response after signup storage.

Do not count button clicks as successful leads. Do not test with real personal data. Closed signup means no production lead event has been tested end-to-end.

## Google admin follow-up

1. Confirm this measurement ID belongs to AVENIQ's web stream.
2. Disable enhanced measurement form interactions and browser-history pageviews to avoid duplicate/unwanted automatic events. Review other automatic measurement options before enabling.
3. Open production homepage, consent, check Realtime / DebugView (debug mode must be enabled through Tag Assistant).
4. Mark `generate_lead` as a key event.
5. Review retention, Google Signals and advertising settings; update the draft privacy policy with actual account/contract terms before opening signups.

## Verification

Local tests and production build checked before deployment. Browser consent and tag loading must be verified after deployment; a successful tag download alone is not evidence of receipt in GA reports.

The public measurement ID is intentionally in source, not a server credential. No Google account password or API secret is needed for browser tagging.

