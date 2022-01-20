# PETITIO-MAT

An online petition where supporters can register, log in, update profile information, provide their signature, redo their signature, and view a list of fellow supporters (those who signed thus far, sorted by location).

</br>

<p align="center">
<img src="/readme-material/landing-page.png" width="400"  alt="Landing page">
<img src="/readme-material/signature.gif" width="400" alt="Signature section">
<img src="/readme-material/slot-machine-spin.gif" width="400" alt="Comment section">
</p>

## Stack

[![Express.js Badge](https://img.shields.io/badge/-Express-000000?style=for-the-badge&labelColor=f7efef&logo=express&logoColor=000000)](#)
[![Handlebars Badge](https://img.shields.io/badge/-Handlebars.js-000000?style=for-the-badge&labelColor=f7efef&logo=handlebars.js&logoColor=000000)](#)
[![JavaScript Badge](https://img.shields.io/badge/-JavaScript-F0DB4F?style=for-the-badge&labelColor=302d2d&logo=javascript&logoColor=F0DB4F)](#)
[![Node.js Badge](https://img.shields.io/badge/-Node.js-3C873A?style=for-the-badge&labelColor=302d2d&logo=node.js&logoColor=3C873A)](#)

### Development

I use _Handlebars templates_ to create HTML dynamically as users provide the input. I create with the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and client-side JavaScript a signature field where registered users can sign the petition with the cursor. The signature and other user info is stored in a local database managed with _PostgreSQL_. To remember who has already signed the petition and to check viewing permissions, I set a cookie. I use _Express Router_ to create subrouters and channel requests.

### Security

I use the _Bcrypt_ library for [salted password hashing](https://crackstation.net/hashing-security.htm#normalhashing) and validation of user input. I employ the _X-Frame-Options_ HTTP response header to prevent attempts at clickjacking and _cookie-session_ middleware to secure info stored in cookies.

## Install & Run

1. Clone the repository: `git clone git@github.com:rubyrazor/petitio-mat.git`
2. Go inside the directory: `cd petitio-mat`
3. Install dependencies: `npm install`
4. Start development server: `node server.js`