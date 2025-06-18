import { createTheme } from "@mui/material";
import { LinkProps } from "@mui/material/Link";
import { Ref } from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router";

type LinkBehaviorProps = Omit<RouterLinkProps, "to"> & {
  href: RouterLinkProps["to"];
  ref?: Ref<HTMLAnchorElement>;
};

function LinkBehavior(props: LinkBehaviorProps) {
  const { href, ref, ...other } = props;
  // Map href (Material UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
}

export const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
});
