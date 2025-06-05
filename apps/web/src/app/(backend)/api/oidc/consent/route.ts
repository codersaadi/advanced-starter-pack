import debug from "debug";
import { type NextRequest, NextResponse } from "next/server";

import { OIDCService } from "@repo/core/server/services/oidc";
import { getUserAuth } from "@repo/shared/utils/server/auth";

const log = debug("org-oidc:consent");

export async function POST(request: NextRequest) {
  log("Received POST request for /oidc/consent, URL: %s", request.url);
  try {
    const formData = await request.formData();
    const consent = formData.get("consent") as string;
    const uid = formData.get("uid") as string;

    log("POST /oauth/consent - uid=%s, choice=%s", uid, consent);

    const oidcService = await OIDCService.initialize();

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let details;
    try {
      details = await oidcService.getInteractionDetails(uid);
      log(
        "Interaction details found - prompt=%s, client=%s",
        details.prompt.name,
        details.params.client_id
      );
    } catch (error) {
      log(
        "Error: Interaction details not found - %s",
        error instanceof Error ? error.message : "unknown error"
      );
      if (
        error instanceof Error &&
        error.message.includes("interaction session not found")
      ) {
        return NextResponse.json(
          {
            error: "invalid_request",
            error_description:
              "Authorization session expired or invalid, please restart the authorization flow",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { prompt } = details;
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let result;
    if (consent === "accept") {
      log(`User accepted the request, Handling 'login' prompt`);
      const { userId } = await getUserAuth();
      log("Obtained userId: %s", userId);

      if (details.prompt.name === "login") {
        result = {
          login: { accountId: userId, remember: true },
        };
      } else {
        log(`Handling 'consent' prompt`);

        const clientId = details.params.client_id as string;

        const grant = await oidcService.findOrCreateGrants(
          userId as string,
          clientId,
          details.grantId
        );

        const missingOIDCScope =
          (prompt.details.missingOIDCScope as string[]) || [];
        if (missingOIDCScope) {
          grant.addOIDCScope(missingOIDCScope.join(" "));
          log("Added OIDC scopes to grant: %s", missingOIDCScope.join(" "));
        }
        const missingOIDCClaims =
          (prompt.details.missingOIDCClaims as string[]) || [];
        if (missingOIDCClaims) {
          grant.addOIDCClaims(missingOIDCClaims);
          log("Added OIDC claims to grant: %s", missingOIDCClaims.join(" "));
        }

        const missingResourceScopes =
          (prompt.details.missingResourceScopes as Record<string, string[]>) ||
          {};
        if (missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            missingResourceScopes
          )) {
            grant.addResourceScope(indicator, scopes.join(" "));
            log(
              "Added resource scopes for %s to grant: %s",
              indicator,
              scopes.join(" ")
            );
          }
        }
        // if (prompt.details.rar) {
        //   prompt.details.rar.forEach(detail => grant.addRar(detail));
        // }

        const newGrantId = await grant.save();
        log("Saved grant with ID: %s", newGrantId);

        result = { consent: { grantId: newGrantId } };

        log("Consent result prepared with grantId");
      }
      log("User %s the authorization", consent);
    } else {
      log("User rejected the request");
      result = {
        error: "access_denied",
        error_description: "User denied the authorization request",
      };
      log("User %s the authorization", consent);
    }

    log("Interaction Result: %O", result);

    const internalRedirectUrlString = await oidcService.getInteractionResult(
      uid,
      result
    );
    log(
      "OIDC Provider internal redirect URL string: %s",
      internalRedirectUrlString
    );

    // // Construct the handoff URL
    // const handoffUrl = new URL('/oauth/handoff', request.nextUrl.origin);
    // // Set the original redirect URL as the 'target' query parameter (URL encoded)
    // handoffUrl.searchParams.set('target', internalRedirectUrlString);
    //
    // log('Redirecting to handoff page: %s', handoffUrl.toString());
    // // Redirect to the handoff page
    // return NextResponse.redirect(handoffUrl.toString(), {
    //   headers: request.headers, // Keep original headers if necessary
    //   status: 303,
    // });

    return NextResponse.redirect(internalRedirectUrlString, {
      headers: request.headers,
      status: 303,
    });
  } catch (error) {
    log(
      "Error processing consent: %s",
      error instanceof Error ? error.message : "unknown error"
    );
    console.error("Error processing consent:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Error processing consent",
      },
      { status: 500 }
    );
  }
}
