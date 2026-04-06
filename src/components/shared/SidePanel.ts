import styled from 'styled-components';

export const SidePanel = styled.div<{
  $open: boolean;
  $desktopVisible?: boolean;
  $desktopSlide?: boolean;
  $width?: string;
  $mobileHeight?: string;
  $gap?: string;
}>`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ $width }) => {
    return $width ?? '280px';
  }};
  height: 100vh;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-left: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => {
    return $gap ?? '16px';
  }};
  z-index: ${({ theme }) => {
    return theme.zIndex.panel;
  }};
  overflow-y: auto;

  @media (min-width: 601px) {
    ${({ $open, $desktopSlide, $desktopVisible, $width }) => {
      const visible = $desktopVisible ?? $open;
      if ($desktopSlide) {
        const w = $width ?? '280px';
        return `right: ${visible ? '0' : `calc(-${w} - 24px)`}; transition: right 0.25s ease;`;
      }
      return `opacity: ${visible ? '1' : '0'}; pointer-events: ${visible ? 'auto' : 'none'}; transition: opacity 0.25s ease;`;
    }}
  }

  @media (max-width: 600px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: ${({ $open, $mobileHeight }) => {
      return $open ? '0' : `-${$mobileHeight ?? '60vh'}`;
    }};
    width: 100%;
    height: ${({ $mobileHeight }) => {
      return $mobileHeight ?? '60vh';
    }};
    border-left: none;
    border-top: 2px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`;
