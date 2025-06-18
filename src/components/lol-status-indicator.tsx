import { Circle } from "@mui/icons-material";
import { ListItem, ListItemButton, ListItemIcon, Tooltip } from "@mui/material";

import { useLOLRunningState } from "../hooks";
import { useI18n } from "../i18n";

export function LolStatusIndicator() {
  const isLolRunning = useLOLRunningState();
  const { t } = useI18n();

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <Tooltip
        title={
          isLolRunning
            ? t["com.lol.status.running"]()
            : t["com.lol.status.not-running"]()
        }
        placement="right"
      >
        <ListItemButton sx={{ justifyContent: "center" }}>
          <ListItemIcon sx={{ justifyContent: "center", minWidth: 0 }}>
            <Circle
              sx={{
                color: isLolRunning ? "success.main" : "error.main",
                fontSize: 20,
              }}
            />
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}
