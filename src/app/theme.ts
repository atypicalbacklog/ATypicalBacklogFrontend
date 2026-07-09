import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2a2a2a',
      paper: 'rgba(50, 50, 50, 1)',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarGutter: 'stable',
        },
        body: {
          scrollbarGutter: 'stable',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
          backdropFilter: 'none',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
          backdropFilter: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(50, 50, 50, 1)',
            '&:hover': {
              backgroundColor: 'rgba(60, 60, 60, 1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(70, 70, 70, 1)',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableScrollLock: true,
        },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.87)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(50, 50, 50, 1)',
            '&:hover': {
              backgroundColor: 'rgba(60, 60, 60, 1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(70, 70, 70, 1)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
          '&:hover': {
            backgroundColor: 'rgba(60, 60, 60, 1)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(70, 70, 70, 1)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            backgroundColor: 'rgba(50, 50, 50, 1)',
            '&:hover': {
              backgroundColor: 'rgba(60, 60, 60, 1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(70, 70, 70, 1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
          },
        },
        contained: {
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '& .MuiCheckbox-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
          '&:hover': {
            backgroundColor: 'rgba(60, 60, 60, 1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(70, 70, 70, 1)',
            '&:hover': {
              backgroundColor: 'rgba(80, 80, 80, 1)',
            },
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(50, 50, 50, 1)',
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
  },
});
