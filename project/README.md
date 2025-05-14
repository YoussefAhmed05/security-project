# Classical Cryptography Visualizer

An interactive educational tool for visualizing classical and modern encryption algorithms, with step-by-step process visualization and AI-powered cryptanalysis.

## Features

- Encrypt and decrypt messages using multiple chained algorithms
- Support for classical ciphers (Caesar, Affine, Monoalphabetic) and AES
- Step-by-step visualization of the encryption/decryption process
- AI-powered cryptanalysis using Google Gemini API
- Dark and light theme support
- Educational information about each algorithm's properties and weaknesses

## AI Cryptanalysis

The application integrates with Google's Gemini AI to provide automated cryptographic analysis after the encryption/decryption process completes. The analysis evaluates:

- Algorithm strength and security properties
- Potential vulnerabilities and attack vectors
- Key quality and security parameters
- Pipeline effectiveness and algorithm placement
- Educational insights about each algorithm
- Recommendations for security improvements

### Setup

To use the AI cryptanalysis feature, you need to:

1. Get a Google Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Create a `.env` file in the project root
3. Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Technologies

- React
- TypeScript
- Vite
- TailwindCSS
- Google Generative AI SDK

## License

MIT
