import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => {
      return theme.background;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    overscroll-behavior: none;
  }

  #root {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }

  @keyframes marchingAnts {
    to { stroke-dashoffset: -9; }
  }
`;

export default GlobalStyles;
