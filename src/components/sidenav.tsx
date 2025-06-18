import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  styled,
} from "@mui/material";
import { useLocation } from "react-router";

import { RouterInfo } from "../router";

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: theme.spacing(7),
}));

type SideNavProps = {
  routerInfos: RouterInfo[];
};

export function SideNav({ routerInfos }: SideNavProps) {
  const pathname = useLocation().pathname;

  return (
    <Drawer variant="permanent">
      <List>
        {routerInfos.map(({ path, NavIcon }) => (
          <ListItem disablePadding sx={{ display: "block" }} key={path}>
            <ListItemButton
              sx={{ justifyContent: "center" }}
              selected={pathname === path}
              href={path}
            >
              <ListItemIcon sx={{ justifyContent: "center", minWidth: 0 }}>
                <NavIcon />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
