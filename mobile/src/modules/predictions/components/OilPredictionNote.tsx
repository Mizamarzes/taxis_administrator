import { useCallback } from "react"
import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { getToneColor } from "@/components/ui/Badge"
import { useFocusQuery } from "@/hooks/useFocusQuery"
import { useTheme } from "@/theme/useTheme"
import { describeBasis, describeDue, OIL_PREDICTION_STATUS } from "../constants"
import { getOilChangePredictionsService } from "../services/prediction.service"

export function OilPredictionNote({ vehicleId }: { vehicleId: number }) {
  const theme = useTheme()
  const fetcher = useCallback(
    () => getOilChangePredictionsService(vehicleId).then((response) => response.data.predictions[0] ?? null),
    [vehicleId],
  )
  const query = useFocusQuery(fetcher)
  const prediction = query.data

  if (!prediction || prediction.status === "none") return null

  const color = getToneColor(theme, OIL_PREDICTION_STATUS[prediction.status].tone)
  const basis = describeBasis(prediction)

  return (
    <View style={[styles.note, { borderColor: theme.accent + "55", backgroundColor: theme.accent + "12" }]}>
      <Ionicons name="sparkles" size={16} color={theme.accent} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.foreground }]}>
          Predicción: <Text style={{ color }}>{describeDue(prediction)}</Text>
        </Text>
        {basis && <Text style={[styles.basis, { color: theme.mutedForeground }]}>{basis}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  note: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "600" },
  basis: { fontSize: 12 },
})
