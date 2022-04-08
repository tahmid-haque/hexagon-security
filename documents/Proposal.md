# Project NoAccess

## Project Title
**Hexagon**

## Team Members
- Tahmid Haque
- Raisa Haque
- Junaid Syed

## Description
*Hexagon* is a browser-centric security tool, capable of managing a user’s passwords,  2FA keys, and manage their overall security practices on the web. As part of this tool, there will be a website to manage data, along with a chrome extension to facilitate quick actions such as saving/filling passwords and adding 2FA keys to their profile. In addition, this tool will support a few auxiliary features such as maintaining secure notes, providing users with information about potential data breaches and potentially sharing passwords with other users. The goal of *Hexagon* is to enable all these functions while maintaining a secure and private environment, resilient to cyber attacks.

## Key Features (Beta Version)
- **Web App**
    - User authentication and dashboard
    - Ability to add/change/delete user passwords
    - Ability to add/delete 2FA keys and retrieve generated OTPs
- **Chrome Extension**
    - Ability to save/autofill current website’s passwords
    - Ability to save 2FA keys to profile, direct from extension

## Key Features (Final Version)
In addition to the beta version's features, the final will have the following additional functions:
- **Web App**
    - Secure Notes management (adding / editing / deleting)
    - Ability to view potential data breaches tied to saved accounts
    - (Potentially) sharing passwords / notes with other users
    - (Potentially) allowing users to recover accounts via email / text
- **Chrome Extension**
    - Generating a secure password for the current website
    - (Potentially) managing the current website’s saved accounts
    - (Potentially) retrieving OTP codes direct from the extension, after password entry

## Tech Stack
- **Front End**: React, TypeScript / JavaScript, HTML, SCSS
- **Back End**: Node.js, Express, MongoDB, GraphQL
- **Deployment**: Heroku (tentatively)

## Technical Challenges
- Securing all stored data and ensuring that in the case of data breaches, no valuable data will be compromised. Since this app stores sensitive data, security is the top priority and will need to be implemented carefully.
- Autofilling / saving authentication information via the chrome extension. Websites vary in the way they want users to log in and the way they format their web pages. Parsing through the page and obtaining the user’s account information may be tricky given the dynamic environment.
- Allowing users to share saved accounts / notes is a potential feature. Sharing must be implemented in a secure way. Only what the user chooses to share should be shared and permissions need to be revocable.
- If account recovery gets implemented, there will need to be interactions over email / text. Linking with external platforms adds additional overhead and coupling.
- Generating secure passwords needs to account for the varied security requirements for a website.
