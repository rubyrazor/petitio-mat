# PETITIO-MAT

An online PETITIO-MAT where supporters can register, provide a signature and find out about the important issue they've just singed for by letting PETITO-MAT's random reels spin. I built the network in an intense one-week project while attending a full-time coding bootcamp with SPICED Academy, Berlin, from Sept 2021 to Dec 2021.


</br>

<p align="center">
<img src="/readme-material/landing-page.png" width="400"  alt="Landing page">
<img src="/readme-material/signature.gif" width="400" alt="Signature section">
<img src="/readme-material/slot-machine-spin.gif" width="400" alt="Comment section">
</p>

## Features

The PETITIO-MAT allows user to

- register,
- log in,
- update profile information,
- provide a signature,
- redo their signature,
- view a list of fellow supporters,

and, last but not least, let the PETITION-MAT's random reels spin.

## Stack

[![Express.js Badge](https://img.shields.io/badge/-Express.js-000000?style=for-the-badge&labelColor=f7efef&logo=express&logoColor=000000)](#)
[![Handlebars Badge](https://img.shields.io/badge/-Handlebars.js-000000?style=for-the-badge&labelColor=f7efef&logo=handlebars.js&logoColor=000000)](#)
[![JavaScript Badge](https://img.shields.io/badge/-JavaScript-F0DB4F?style=for-the-badge&labelColor=302d2d&logo=javascript&logoColor=F0DB4F)](#)
[![Node.js Badge](https://img.shields.io/badge/-Node.js-3C873A?style=for-the-badge&labelColor=302d2d&logo=node.js&logoColor=3C873A)](#)
[![PostgreSQL Badge](https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&labelColor=f7efef&logo=postgreSQL&logoColor=4169E1)](#)

### Development

The **client-side** is build using _Handlebars_ templates to dynamically create HTML as users provide input. The signature field is made combining client-side _JavaScript_ and the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). I also use client-side _JavaScript_ to create the spinning reels effect known from slot machines. 

The **server-side** is built with _Express_ and _Node_. To remember who has already signed the petition and to check viewing permissions, I set cookies. I use _Express Router_ to create subrouters and channel requests accordingly. All user data is stored in a local database managed with _PostgreSQL_.

### Security

I use the _Bcrypt_ library for [salted password hashing](https://crackstation.net/hashing-security.htm#normalhashing) and validation of user input. I added a _X-Frame-Options_ HTTP response header to prevent attempts at clickjacking and _Cookie-Session_ middleware to encode the data stored in the cookies and prevent tampering.

### Testing

I use _SuperTest_ to test HTTP request handling by sending specific requests to the _Express_ app and check whether the respones match my assertions.

## Install & Run

1. Clone repository: `git clone git@github.com:rubyrazor/petitio-mat.git`
2. Navigate into directory: `cd petitio-mat`
3. Install dependencies: `npm install`
4. Run development server: `node server.js`
