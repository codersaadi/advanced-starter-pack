export default {
  backButton: 'Back',
  badge__default: 'Default',
  badge__otherImpersonatorDevice: 'Other impersonator device',
  badge__primary: 'Primary',
  badge__requiresAction: 'Requires action',
  badge__thisDevice: 'This device',
  badge__unverified: 'Unverified',
  badge__userDevice: 'User device',
  badge__you: 'You',
  createOrganization: {
    formButtonSubmit: 'Create organization',
    invitePage: {
      formButtonReset: 'Skip',
    },
    title: 'Create organization',
  },
  dates: {
    lastDay: "Yesterday at {{ date | timeString('en-US') }}",
    next6Days:
      "{{ date | weekday('en-US','long') }} at {{ date | timeString('en-US') }}",
    nextDay: "Tomorrow at {{ date | timeString('en-US') }}",
    numeric: "{{ date | numeric('en-US') }}",
    previous6Days:
      "Last {{ date | weekday('en-US','long') }} at {{ date | timeString('en-US') }}",
    sameDay: "Today at {{ date | timeString('en-US') }}",
  },
  dividerText: 'or',
  footerActionLink__useAnotherMethod: 'Use another method',
  footerPageLink__help: 'Help',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Terms',
  formButtonPrimary: 'Continue',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Forgot password?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired:
    'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Optional',
  formFieldHintText__slug:
    'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations:
    'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Backup code',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Confirm password',
  formFieldLabel__currentPassword: 'Current password',
  formFieldLabel__emailAddress: 'Email address',
  formFieldLabel__emailAddress_username: 'Email address or username',
  formFieldLabel__emailAddresses: 'Email addresses',
  formFieldLabel__firstName: 'First name',
  formFieldLabel__lastName: 'Last name',
  formFieldLabel__newPassword: 'New password',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending:
    'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Name',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Name of passkey',
  formFieldLabel__password: 'Password',
  formFieldLabel__phoneNumber: 'Phone number',
  formFieldLabel__role: 'Role',
  formFieldLabel__signOutOfOtherSessions: 'Sign out of all other devices',
  formFieldLabel__username: 'Username',
  impersonationFab: {
    action__signOut: 'Sign out',
    title: 'Signed in as {{identifier}}',
  },
  locale: 'en-US',
  maintenanceMode:
    "We are currently undergoing maintenance, but don't worry, it shouldn't take more than a few minutes.",
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Member',
  membershipRole__guestMember: 'Guest',
  organizationList: {
    action__createOrganization: 'Create organization',
    action__invitationAccept: 'Join',
    action__suggestionsAccept: 'Request to join',
    createOrganization: 'Create Organization',
    invitationAcceptedLabel: 'Joined',
    subtitle: 'to continue to {{applicationName}}',
    suggestionsAcceptedLabel: 'Pending approval',
    title: 'Choose an account',
    titleWithoutPersonal: 'Choose an organization',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatic invitations',
    badge__automaticSuggestion: 'Automatic suggestions',
    badge__manualInvitation: 'No automatic enrollment',
    badge__unverified: 'Unverified',
    createDomainPage: {
      subtitle:
        'Add the domain to verify. Users with email addresses at this domain can join the organization automatically or request to join.',
      title: 'Add domain',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'The invitations could not be sent. There are already pending invitations for the following email addresses: {{email_addresses}}.',
      formButtonPrimary__continue: 'Send invitations',
      selectDropdown__role: 'Select role',
      subtitle:
        'Enter or paste one or more email addresses, separated by spaces or commas.',
      successMessage: 'Invitations successfully sent',
      title: 'Invite new members',
    },
    membersPage: {
      action__invite: 'Invite',
      activeMembersTab: {
        menuAction__remove: 'Remove member',
        tableHeader__actions: '',
        tableHeader__joined: 'Joined',
        tableHeader__role: 'Role',
        tableHeader__user: 'User',
      },
      detailsTitle__emptyRow: 'No members to display',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revoke invitation',
        tableHeader__invited: 'Invited',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Users who sign up with a matching email domain, will be able to see a suggestion to request to join your organization.',
          headerTitle: 'Automatic suggestions',
          primaryButton: 'Manage verified domains',
        },
        menuAction__approve: 'Approve',
        menuAction__reject: 'Reject',
        tableHeader__requested: 'Requested access',
        table__emptyRow: 'No requests to display',
      },
      start: {
        headerTitle__invitations: 'Invitations',
        headerTitle__members: 'Members',
        headerTitle__requests: 'Requests',
      },
    },
    navbar: {
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      title: 'Organization',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1: 'Are you sure you want to delete this organization?',
          messageLine2: 'This action is permanent and irreversible.',
          successMessage: 'You have deleted the organization.',
          title: 'Delete organization',
        },
        leaveOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1:
            'Are you sure you want to leave this organization? You will lose access to this organization and its applications.',
          messageLine2: 'This action is permanent and irreversible.',
          successMessage: 'You have left the organization.',
          title: 'Leave organization',
        },
        title: 'Danger',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Add domain',
        subtitle:
          'Allow users to join the organization automatically or request to join based on a verified email domain.',
        title: 'Verified domains',
      },
      successMessage: 'The organization has been updated.',
      title: 'Update profile',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2:
        'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Members',
      profileSection: {
        primaryButton: 'Update profile',
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Removing this domain will affect invited users.',
        removeDomainActionLabel__remove: 'Remove domain',
        removeDomainSubtitle: 'Remove this domain from your verified domains',
        removeDomainTitle: 'Remove domain',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Users are automatically invited to join the organization when they sign-up and can join anytime.',
        automaticInvitationOption__label: 'Automatic invitations',
        automaticSuggestionOption__description:
          'Users receive a suggestion to request to join, but must be approved by an admin before they are able to join the organization.',
        automaticSuggestionOption__label: 'Automatic suggestions',
        calloutInfoLabel:
          'Changing the enrollment mode will only affect new users.',
        calloutInvitationCountLabel:
          'Pending invitations sent to users: {{count}}',
        calloutSuggestionCountLabel:
          'Pending suggestions sent to users: {{count}}',
        manualInvitationOption__description:
          'Users can only be invited manually to the organization.',
        manualInvitationOption__label: 'No automatic enrollment',
        subtitle:
          'Choose how users from this domain can join the organization.',
      },
      start: {
        headerTitle__danger: 'Danger',
        headerTitle__enrollment: 'Enrollment options',
      },
      subtitle:
        'The domain {{domain}} is now verified. Continue by selecting enrollment mode.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Enter the verification code sent to your email address',
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'The domain {{domainName}} needs to be verified via email.',
      subtitleVerificationCodeScreen:
        'A verification code was sent to {{emailAddress}}. Enter the code to continue.',
      title: 'Verify domain',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Create organization',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Manage',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'No organization selected',
    personalWorkspace: 'Personal account',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Next',
  paginationButton__previous: 'Previous',
  paginationRowText__displaying: 'Displaying',
  paginationRowText__of: 'of',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Get help',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Use a backup code',
      blockButton__emailCode: 'Email code to {{identifier}}',
      blockButton__emailLink: 'Email link to {{identifier}}',
      blockButton__passkey: 'Sign in with your passkey',
      blockButton__password: 'Sign in with your password',
      blockButton__phoneCode: 'Send SMS code to {{identifier}}',
      blockButton__totp: 'Use your authenticator app',
      getHelp: {
        blockButton__emailSupport: 'Email support',
        content:
          'If you’re experiencing difficulty signing into your account, email us and we will work with you to restore access as soon as possible.',
        title: 'Get help',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Use another method',
    },
    backupCodeMfa: {
      subtitle:
        'Your backup code is the one you got when setting up two-step authentication.',
      title: 'Enter a backup code',
    },
    emailCode: {
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'to continue to {{applicationName}}',
      title: 'Check your email',
    },
    emailLink: {
      expired: {
        subtitle: 'Return to the original tab to continue.',
        title: 'This verification link has expired',
      },
      failed: {
        subtitle: 'Return to the original tab to continue.',
        title: 'This verification link is invalid',
      },
      formSubtitle: 'Use the verification link sent to your email',
      formTitle: 'Verification link',
      loading: {
        subtitle: 'You will be redirected soon',
        title: 'Signing in...',
      },
      resendButton: "Didn't receive a link? Resend",
      subtitle: 'to continue to {{applicationName}}',
      title: 'Check your email',
      unusedTab: {
        title: 'You may close this tab',
      },
      verified: {
        subtitle: 'You will be redirected soon',
        title: 'Successfully signed in',
      },
      verifiedSwitchTab: {
        subtitle: 'Return to original tab to continue',
        subtitleNewTab: 'Return to the newly opened tab to continue',
        titleNewTab: 'Signed in on other tab',
      },
    },
    forgotPassword: {
      formTitle: 'Reset password code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email address',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Reset your password',
      label__alternativeMethods: 'Or, sign in with another method',
      title: 'Forgot Password?',
    },
    noAvailableMethods: {
      message:
        "Cannot proceed with sign in. There's no available authentication factor.",
      subtitle: 'An error occurred',
      title: 'Cannot sign in',
    },
    passkey: {
      subtitle:
        "Using your passkey confirms it's you. Your device may ask for your fingerprint, face or screen lock.",
      title: 'Use your passkey',
    },
    password: {
      actionLink: 'Use another method',
      subtitle: 'Enter the password associated with your account',
      title: 'Enter your password',
    },
    passwordPwned: {
      title: 'Password compromised',
    },
    phoneCode: {
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'to continue to {{applicationName}}',
      title: 'Check your phone',
    },
    phoneCodeMfa: {
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle:
        'To continue, please enter the verification code sent to your phone',
      title: 'Check your phone',
    },
    resetPassword: {
      formButtonPrimary: 'Reset Password',
      requiredMessage:
        'For security reasons, it is required to reset your password.',
      successMessage:
        'Your password was successfully changed. Signing you in, please wait a moment.',
      title: 'Set new password',
    },
    resetPasswordMfa: {
      detailsLabel:
        'We need to verify your identity before resetting your password.',
    },
    start: {
      actionLink: 'Sign up',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_passkey: 'Use passkey instead',
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: 'Don’t have an account?',
      subtitle: 'Welcome back! Please sign in to continue',
      title: 'Sign in to {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Verification code',
      subtitle:
        'To continue, please enter the verification code generated by your authenticator app',
      title: 'Two-step verification',
    },
  },
  signInEnterPasswordTitle: 'Enter your password',
  signUp: {
    continue: {
      actionLink: 'Sign in',
      actionText: 'Already have an account?',
      subtitle: 'Please fill in the remaining details to continue.',
      title: 'Fill in missing fields',
    },
    emailCode: {
      formSubtitle: 'Enter the verification code sent to your email address',
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'Enter the verification code sent to your email',
      title: 'Verify your email',
    },
    emailLink: {
      formSubtitle: 'Use the verification link sent to your email address',
      formTitle: 'Verification link',
      loading: {
        title: 'Signing up...',
      },
      resendButton: "Didn't receive a link? Resend",
      subtitle: 'to continue to {{applicationName}}',
      title: 'Verify your email',
      verified: {
        title: 'Successfully signed up',
      },
      verifiedSwitchTab: {
        subtitle: 'Return to the newly opened tab to continue',
        subtitleNewTab: 'Return to previous tab to continue',
        title: 'Successfully verified email',
      },
    },
    phoneCode: {
      formSubtitle: 'Enter the verification code sent to your phone number',
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'Enter the verification code sent to your phone',
      title: 'Verify your phone',
    },
    start: {
      actionLink: 'Sign in',
      actionText: 'Already have an account?',
      subtitle: 'Welcome! Please fill in the details to get started.',
      title: 'Create your account',
    },
  },
  socialButtonsBlockButton: 'Continue with {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address:
      'This email address is taken. Please try another.',
    form_identifier_exists__phone_number:
      'This phone number is taken. Please try another.',
    form_identifier_exists__username:
      'This username is taken. Please try another.',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address:
      'Email address must be a valid email address.',
    form_param_format_invalid__phone_number:
      'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name:
      'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name:
      'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name:
      'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Your password is not strong enough.',
    form_password_pwned:
      'This password has been found as part of a breach and can not be used, please try another password instead.',
    form_password_pwned__sign_in:
      'This password has been found as part of a breach and can not be used, please reset your password.',
    form_password_size_in_bytes_exceeded:
      'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
    form_password_validation_failed: 'Incorrect Password',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed:
      'You cannot delete your last identification.',
    not_allowed_access: '',
    passkey_already_exists: 'A passkey is already registered with this device.',
    passkey_not_supported: 'Passkeys are not supported on this device.',
    passkey_pa_not_supported:
      'Registration requires a platform authenticator but the device does not support it.',
    passkey_registration_cancelled:
      'Passkey registration was cancelled or timed out.',
    passkey_retrieval_cancelled:
      'Passkey verification was cancelled or timed out.',
    passwordComplexity: {
      maximumLength: 'less than {{length}} characters',
      minimumLength: '{{length}} or more characters',
      requireLowercase: 'a lowercase letter',
      requireNumbers: 'a number',
      requireSpecialCharacter: 'a special character',
      requireUppercase: 'an uppercase letter',
      sentencePrefix: 'Your password must contain',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger:
        'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
      notEnough: 'Your password is not strong enough.',
      suggestions: {
        allUppercase: 'Capitalize some, but not all letters.',
        anotherWord: 'Add more words that are less common.',
        associatedYears: 'Avoid years that are associated with you.',
        capitalization: 'Capitalize more than the first letter.',
        dates: 'Avoid dates and years that are associated with you.',
        l33t: "Avoid predictable letter substitutions like '@' for 'a'.",
        longerKeyboardPattern:
          'Use longer keyboard patterns and change typing direction multiple times.',
        noNeed:
          'You can create strong passwords without using symbols, numbers, or uppercase letters.',
        pwned: 'If you use this password elsewhere, you should change it.',
        recentYears: 'Avoid recent years.',
        repeated: 'Avoid repeated words and characters.',
        reverseWords: 'Avoid reversed spellings of common words.',
        sequences: 'Avoid common character sequences.',
        useWords: 'Use multiple words, but avoid common phrases.',
      },
      warnings: {
        common: 'This is a commonly used password.',
        commonNames: 'Common names and surnames are easy to guess.',
        dates: 'Dates are easy to guess.',
        extendedRepeat:
          'Repeated character patterns like "abcabcabc" are easy to guess.',
        keyPattern: 'Short keyboard patterns are easy to guess.',
        namesByThemselves: 'Single names or surnames are easy to guess.',
        pwned: 'Your password was exposed by a data breach on the Internet.',
        recentYears: 'Recent years are easy to guess.',
        sequences: 'Common character sequences like "abc" are easy to guess.',
        similarToCommon: 'This is similar to a commonly used password.',
        simpleRepeat: 'Repeated characters like "aaa" are easy to guess.',
        straightRow:
          'Straight rows of keys on your keyboard are easy to guess.',
        topHundred: 'This is a frequently used password.',
        topTen: 'This is a heavily used password.',
        userInputs: 'There should not be any personal or page related data.',
        wordByItself: 'Single words are easy to guess.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Add account',
    action__manageAccount: 'Manage account',
    action__signOut: 'Sign out',
    action__signOutAll: 'Sign out of all accounts',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copied!',
      actionLabel__copy: 'Copy all',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Print',
      infoText1: 'Backup codes will be enabled for this account.',
      infoText2:
        'Keep the backup codes secret and store them securely. You may regenerate backup codes if you suspect they have been compromised.',
      subtitle__codelist: 'Store them securely and keep them secret.',
      successMessage:
        'Backup codes are now enabled. You can use one of these to sign in to your account, if you lose access to your authentication device. Each code can only be used once.',
      successSubtitle:
        'You can use one of these to sign in to your account, if you lose access to your authentication device.',
      title: 'Add backup code verification',
      title__codelist: 'Backup codes',
    },
    connectedAccountPage: {
      formHint: 'Select a provider to connect your account.',
      formHint__noAccounts:
        'There are no available external account providers.',
      removeResource: {
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2:
          'You will no longer be able to use this connected account and any dependent features will no longer work.',
        successMessage:
          '{{connectedAccount}} has been removed from your account.',
        title: 'Remove connected account',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'The provider has been added to your account',
      title: 'Add connected account',
    },
    deletePage: {
      actionDescription: 'Type "Delete account" below to continue.',
      confirm: 'Delete account',
      messageLine1: 'Are you sure you want to delete your account?',
      messageLine2: 'This action is permanent and irreversible.',
      title: 'Delete account',
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          'An email containing a verification code will be sent to this email address.',
        formSubtitle: 'Enter the verification code sent to {{identifier}}',
        formTitle: 'Verification code',
        resendButton: "Didn't receive a code? Resend",
        successMessage:
          'The email {{identifier}} has been added to your account.',
      },
      emailLink: {
        formHint:
          'An email containing a verification link will be sent to this email address.',
        formSubtitle:
          'Click on the verification link in the email sent to {{identifier}}',
        formTitle: 'Verification link',
        resendButton: "Didn't receive a link? Resend",
        successMessage:
          'The email {{identifier}} has been added to your account.',
      },
      removeResource: {
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2:
          'You will no longer be able to sign in using this email address.',
        successMessage: '{{emailAddress}} has been removed from your account.',
        title: 'Remove email address',
      },
      title: 'Add email address',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continue',
    formButtonPrimary__finish: 'Finish',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Cancel',
    mfaPage: {
      formHint: 'Select a method to add.',
      title: 'Add two-step verification',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Add phone number',
      removeResource: {
        messageLine1:
          '{{identifier}} will be no longer receiving verification codes when signing in.',
        messageLine2:
          'Your account may not be as secure. Are you sure you want to continue?',
        successMessage:
          'SMS code two-step verification has been removed for {{mfaPhoneCode}}',
        title: 'Remove two-step verification',
      },
      subtitle__availablePhoneNumbers:
        'Select an existing phone number to register for SMS code two-step verification or add a new one.',
      subtitle__unavailablePhoneNumbers:
        'There are no available phone numbers to register for SMS code two-step verification, please add a new one.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Add SMS code verification',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scan QR code instead',
        buttonUnableToScan__nonPrimary: 'Can’t scan QR code?',
        infoText__ableToScan:
          'Set up a new sign-in method in your authenticator app and scan the following QR code to link it to your account.',
        infoText__unableToScan:
          'Set up a new sign-in method in your authenticator and enter the Key provided below.',
        inputLabel__unableToScan1:
          'Make sure Time-based or One-time passwords is enabled, then finish linking your account.',
        inputLabel__unableToScan2:
          'Alternatively, if your authenticator supports TOTP URIs, you can also copy the full URI.',
      },
      removeResource: {
        messageLine1:
          'Verification codes from this authenticator will no longer be required when signing in.',
        messageLine2:
          'Your account may not be as secure. Are you sure you want to continue?',
        successMessage:
          'Two-step verification via authenticator application has been removed.',
        title: 'Remove two-step verification',
      },
      successMessage:
        'Two-step verification is now enabled. When signing in, you will need to enter a verification code from this authenticator as an additional step.',
      title: 'Add authenticator application',
      verifySubtitle: 'Enter verification code generated by your authenticator',
      verifyTitle: 'Verification code',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} will be removed from this account.',
        title: 'Remove passkey',
      },
      subtitle__rename:
        'You can change the passkey name to make it easier to find.',
      title__rename: 'Rename Passkey',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly:
        'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      successMessage__set: 'Your password has been set.',
      successMessage__signOutOfOtherSessions:
        'All other devices have been signed out.',
      successMessage__update: 'Your password has been updated.',
      title__set: 'Set password',
      title__update: 'Update password',
    },
    phoneNumberPage: {
      infoText:
        'A text message containing a verification code will be sent to this phone number. Message and data rates may apply.',
      removeResource: {
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2:
          'You will no longer be able to sign in using this phone number.',
        successMessage: '{{phoneNumber}} has been removed from your account.',
        title: 'Remove phone number',
      },
      successMessage: '{{identifier}} has been added to your account.',
      title: 'Add phone number',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Recommended size 1:1, up to 10MB.',
      imageFormDestructiveActionSubtitle: 'Remove',
      imageFormSubtitle: 'Upload',
      imageFormTitle: 'Profile image',
      readonly:
        'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Your profile has been updated.',
      title: 'Update profile',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Sign out of device',
        title: 'Active devices',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Try again',
        actionLabel__reauthorize: 'Authorize now',
        destructiveActionTitle: 'Remove',
        primaryButton: 'Connect account',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Connected accounts',
      },
      dangerSection: {
        deleteAccountButton: 'Delete account',
        title: 'Delete account',
      },
      emailAddressesSection: {
        destructiveAction: 'Remove email',
        detailsAction__nonPrimary: 'Set as primary',
        detailsAction__primary: 'Complete verification',
        detailsAction__unverified: 'Verify',
        primaryButton: 'Add email address',
        title: 'Email addresses',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Profile details',
      headerTitle__security: 'Security',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Regenerate',
          headerTitle: 'Backup codes',
          subtitle__regenerate:
            'Get a fresh set of secure backup codes. Prior backup codes will be deleted and cannot be used.',
          title__regenerate: 'Regenerate backup codes',
        },
        phoneCode: {
          actionLabel__setDefault: 'Set as default',
          destructiveActionLabel: 'Remove',
        },
        primaryButton: 'Add two-step verification',
        title: 'Two-step verification',
        totp: {
          destructiveActionTitle: 'Remove',
          headerTitle: 'Authenticator application',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Remove',
        menuAction__rename: 'Rename',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Set password',
        primaryButton__updatePassword: 'Update password',
        title: 'Password',
      },
      phoneNumbersSection: {
        destructiveAction: 'Remove phone number',
        detailsAction__nonPrimary: 'Set as primary',
        detailsAction__primary: 'Complete verification',
        detailsAction__unverified: 'Verify phone number',
        primaryButton: 'Add phone number',
        title: 'Phone numbers',
      },
      profileSection: {
        primaryButton: 'Update profile',
        title: 'Profile',
      },
      usernameSection: {
        primaryButton__setUsername: 'Set username',
        primaryButton__updateUsername: 'Update username',
        title: 'Username',
      },
      web3WalletsSection: {
        destructiveAction: 'Remove wallet',
        primaryButton: 'Web3 wallets',
        title: 'Web3 wallets',
      },
    },
    usernamePage: {
      successMessage: 'Your username has been updated.',
      title__set: 'Set username',
      title__update: 'Update username',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2:
          'You will no longer be able to sign in using this web3 wallet.',
        successMessage: '{{web3Wallet}} has been removed from your account.',
        title: 'Remove web3 wallet',
      },
      subtitle__availableWallets:
        'Select a web3 wallet to connect to your account.',
      subtitle__unavailableWallets: 'There are no available web3 wallets.',
      successMessage: 'The wallet has been added to your account.',
      title: 'Add web3 wallet',
    },
  },
};
