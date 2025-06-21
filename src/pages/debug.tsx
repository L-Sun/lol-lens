import ReactJsonView from "@microlink/react-json-view";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEventTarget } from "ahooks";
import { useCallback, useState } from "react";

import { useLcuApi, useLcuCall, useLcuEvent } from "../hooks";
import { Endpoint } from "../lcu/types";

function ApiDebugger() {
  const [endpoint, { onChange }] = useEventTarget({
    initialValue: "/lol-summoner/v1/current-summoner",
  });
  const { data, error, loading, run } = useLcuApi(endpoint as Endpoint);

  const handleTest = useCallback(() => {
    run();
  }, [endpoint, run]);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        LCU API Debug
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="LCU API Endpoint"
          value={endpoint}
          onChange={onChange}
          placeholder="Enter LCU API endpoint (e.g. /lol-summoner/v1/current-summoner)"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleTest}
          disabled={loading || !endpoint}
        >
          {loading ? "Testing..." : "Test Endpoint"}
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "error.light" }}>
          <Typography color="error">{error.message}</Typography>
        </Paper>
      )}
      {data && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Response:
          </Typography>
          <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
            <ReactJsonView src={data} collapsed={true} />
          </Box>
        </Paper>
      )}
    </>
  );
}

function WebSocketDebugger() {
  const [eventName, { onChange }] = useEventTarget({
    initialValue: "OnJsonApiEvent",
  });
  const [eventData, setEventData] = useState<object>();

  useLcuEvent(eventName as Endpoint, setEventData as (d: unknown) => void);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Event Subscription
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Event Name"
          value={eventName}
          onChange={onChange}
          placeholder="Enter event name (e.g. OnJsonApiEvent)"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="secondary"
          disabled={!eventName}
          // onClick={handleSubscribe}
        >
          Subscribe
        </Button>
      </Box>

      {eventData && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Event Data:
          </Typography>
          <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
            <ReactJsonView src={eventData} collapsed={true} />
          </Box>
        </Paper>
      )}
    </>
  );
}

export function Debug() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        LCU API Debug Tool
      </Typography>

      <ApiDebugger />

      <Divider sx={{ my: 4 }} />

      <WebSocketDebugger />
    </Container>
  );
}
