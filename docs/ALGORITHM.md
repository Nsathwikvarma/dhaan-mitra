# Technical Agronomic Algorithm Breakdown — Dhaan Mitra

## 1. Weather & Yard Capacity Scoring Engine

The slot evaluation engine calculates slot suitability based on live weather predictions and yard load:

$$\text{Slot Score} = S_{\text{Weather}} + S_{\text{Capacity}} + S_{\text{Queue}}$$

- **Weather Factor ($S_{\text{Weather}}$, Max 40 Points)**: Evaluates rainfall probability $P_{\text{rain}}$ and relative humidity $H$. Rain $> 50\%$ reduces score to 8 pts.
- **Yard Capacity ($S_{\text{Capacity}}$, Max 35 Points)**: Evaluates utilization ratio $U = \frac{\text{Booked} + \text{Requested}}{\text{Daily Capacity}}$.
- **Queue Load ($S_{\text{Queue}}$, Max 25 Points)**: Evaluates active tractor arrival queue at target hour.

---

## 2. Agronomic Field Drying Days Formula

When procurer inspection records grain moisture $M_{\text{measured}}$ above procurement threshold $M_{\text{target}}$ (e.g. 14.0%):

$$\text{Excess Moisture } (E) = M_{\text{measured}} - M_{\text{target}}$$

Daily sun drying rate $R$ (% moisture reduction per day) is computed from ambient village weather:

$$R = \begin{cases} 
0.85\%/\text{day} & \text{if } \text{Temp} \ge 32^\circ\text{C}, H \le 60\%, P_{\text{rain}} \le 15\% \\ 
0.65\%/\text{day} & \text{if } \text{Temp} \ge 28^\circ\text{C}, H \le 70\%, P_{\text{rain}} \le 30\% \\ 
0.30\%/\text{day} & \text{if } H > 75\% \text{ or } P_{\text{rain}} > 40\% 
\end{cases}$$

$$\text{Minimum Sun Drying Days Required } (D) = \left\lceil \frac{E}{R} \right\rceil$$

### Date Locking & Priority Allocation
- **Date Locking**: All slots on dates before $\text{Current Date} + D$ are automatically locked out.
- **Priority Allocation**: Re-booking slots starting on $\text{Current Date} + D$ are flagged with `PRIORITY QUEUE GRANTED` to guarantee immediate intake once grain is dry.
