import PersonIcon from "@mui/icons-material/Person";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";

export function Sidebar() {
  return (
    <Drawer variant="permanent">
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton sx={{ justifyContent: "center" }}>
            <ListItemIcon sx={{ justifyContent: "center", minWidth: 0 }}>
              <PersonIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
