import { createTheme } from "@mui/material/styles";


let theme = createTheme({
    palette: {
      primary: {
        main: '#D68FD6',
        dark: '#ab47bc'
      },
      secondary: {
        main: '#edf2ff',
        dark: '#d32f2f'
      },
      error: {
        main: "#ffa726"
      }
    },
  });

  export default theme