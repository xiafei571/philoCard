# PhiloCard

PhiloCard is a web application designed to generate and display philosophical quotes, aiming to inspire daily reflection and deep thinking.

## Project Description

PhiloCard randomly selects philosophical quotes from renowned thinkers and presents them on visually appealing cards. Each card features a quote on the front, along with a background image, and provides additional context or explanation on the back. This project aims to:

1. Introduce users to profound philosophical ideas in an accessible format.
2. Encourage daily reflection on life, ethics, and existence.
3. Provide a visually engaging way to explore philosophical concepts.

## Install

```bash
yarn install
```
```bash
yarn build
```
```bash
yarn start
```

## Technology Stack

- Next.js
- React
- CSS Modules
- html2canvas for image generation

```
.container
├── .mainContainer
│   ├── .middleSection
│   │   └── .card 或 .placeholder
│   │       ├── .cardInner
│   │       │   ├── .cardFront
│   │       │   │   ├── img
│   │       │   │   └── .quoteOverlay
│   │       │   └── .cardBack
│   │       │       └── .cardBackContent
│   │       │           ├── h3
│   │       │           └── p
│   │       └── (动态类：.flipped, .loading)
│   └── .iconSection
│       ├── .iconButton.nextButton
│       │   └── FaRedo 或 FaRedo.spinning
│       ├── .iconButton.downloadButton
│       │   └── FaShare 或 FaDownload
│       └── .iconButton.favoriteButton
│           └── FaStar 或 FaRegStar
└── .footer
    ├── .footerLink (Home)
    ├── .footerLink (My Card)
    └── .footerLink (Setting)
```

## CORS
```bash
gsutil cors set cors.json gs://philo-card.appspot.com
```