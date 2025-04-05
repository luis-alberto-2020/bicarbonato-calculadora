import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;

@Component // Indica a Spring que gestione este componente
public class TareaVencimientoBidones {

    // --- Inyección de Dependencias ---
    // Spring inyectará automáticamente las instancias de estos servicios
    @Autowired
    private ServicioLotesBidones servicioLotes; // Servicio para interactuar con la tabla lotes_bidones

    @Autowired
    private ServicioLog servicioLog; // Servicio para registrar eventos

    @Autowired
    private ServicioNotificacionesWebSocket servicioNotificaciones; // Servicio para enviar mensajes WebSocket

    @Autowired
    private ServicioConfiguracion servicioConfiguracion; // Servicio para leer configuración (ej: horas de vencimiento)


    // --- Tarea Programada ---
    // Se ejecuta cada 5 minutos (300,000 milisegundos)
    // Se puede ajustar el intervalo según sea necesario
    @Scheduled(fixedRate = 300000)
    public void verificarYActualizarLotesVencidos() {
        Instant ahoraEnUtc = Instant.now(); // Hora actual en UTC (ideal para comparar con TIMESTAMP)
        System.out.println("LOG TAREA: Iniciando verificación de lotes vencidos - " + ahoraEnUtc); // Log simple en consola

        try {
            // 1. Obtener horas de vencimiento desde configuración (ej. 5 horas)
            int horasVencimiento = servicioConfiguracion.getHorasVencimientoBidon(); // Este método leería de la BD

            // 2. Buscar lotes EN_USO que ya pasaron su hora de vencimiento
            //    El servicioLotes haría la consulta a la BD: SELECT * FROM lotes_bidones WHERE estado = 'EN_USO' AND ts_vencimiento <= ?
            List<LoteBidones> lotesVencidos = servicioLotes.buscarLotesVencidos("EN_USO", ahoraEnUtc);

            if (lotesVencidos != null && !lotesVencidos.isEmpty()) {
                System.out.println("LOG TAREA: Lotes vencidos encontrados: " + lotesVencidos.size());

                // 3. Procesar cada lote vencido encontrado
                for (LoteBidones lote : lotesVencidos) {
                    // 4. Actualizar el estado del lote a 'SUCIOS' en la BD
                    boolean actualizado = servicioLotes.actualizarEstadoLote(lote.getIdLote(), "SUCIOS");

                    if (actualizado) {
                        // 5. Registrar el evento de vencimiento en el log
                        servicioLog.registrarEvento(
                                "LOTE_VENCIDO", // tipo_evento
                                null,           // id_usuario (evento automático del sistema)
                                lote.getIdLote(), // id_lote_afectado
                                "Transición automática por " + horasVencimiento + "h cumplidas."
                                // Podríamos añadir más detalles si fuera necesario
                        );
                        System.out.println("LOG TAREA: Lote " + lote.getIdLote() + " actualizado a SUCIOS.");
                    } else {
                         // Registrar si hubo un error al actualizar ESE lote específico
                         System.err.println("ERROR TAREA: No se pudo actualizar estado del lote vencido: " + lote.getIdLote());
                         servicioLog.registrarEvento("ERROR_UPDATE_LOTE_VENCIDO", null, lote.getIdLote(), "Fallo al actualizar estado a SUCIOS");
                    }
                } // Fin del bucle for

                // 6. Notificar al Frontend (IMPORTANTE)
                //    Enviar un mensaje genérico o los contadores actualizados
                //    para que los dashboards de los usuarios se refresquen.
                servicioNotificaciones.notificarActualizacionContadoresBidones(); // Ejemplo de método
                System.out.println("LOG TAREA: Notificación WebSocket enviada.");

            } else {
                 System.out.println("LOG TAREA: No hay lotes vencidos para procesar.");
            }

        } catch (Exception e) {
            // Capturar cualquier error inesperado durante la ejecución
            System.err.println("ERROR TAREA: Excepción inesperada en verificarYActualizarLotesVencidos: " + e.getMessage());
            // Loguear el error completo para diagnóstico
             servicioLog.registrarEvento("ERROR_TAREA_VENCIMIENTO", null, null, "Excepción general: " + e.getMessage());
            // Considerar e.printStackTrace(); para debugging si es necesario
        }
        System.out.println("LOG TAREA: Finalizada verificación de lotes vencidos - " + Instant.now());
    }
}

// --- NOTAS ADICIONALES ---
// - Necesitaríamos definir la clase/entidad LoteBidones (con campos idLote, estado, etc.).
// - Necesitaríamos implementar los métodos en los servicios (ej. buscarLotesVencidos, actualizarEstadoLote, registrarEvento, notificarActualizacionContadoresBidones, getHorasVencimientoBidon).
// - La implementación exacta de la notificación WebSocket dependerá de la librería usada (ej. Spring WebSockets + STOMP).