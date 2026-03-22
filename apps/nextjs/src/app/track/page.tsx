"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./tracking.module.css";

// Dynamically import the map component (Leaflet requires window)
const TrackingMap = dynamic(() => import("./tracking-map"), { ssr: false });

const API_BASE = "/api/track";

interface TrackerData {
  progress_percentage?: number;
  current_destination_eta?: number;
  estimated_completion_time_formatted?: string;
  current_destination?: { address?: string };
  first_waypoint_completed?: boolean;
  last_waypoint_completed?: boolean;
  driver_current_location?: { coordinates?: number[] };
}

interface Driver {
  id: string;
  name: string;
  phone?: string;
  photo_url?: string;
  vehicle_name?: string;
  vehicle_avatar?: string;
  online: boolean;
  coordinates?: [number, number];
  heading?: number;
}

interface Place {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Entity {
  name?: string;
  tracking?: string;
  photo_url?: string;
  description?: string;
}

interface TrackingStatus {
  status: string;
  details?: string;
  created_at: string;
}

interface Order {
  id: string;
  tracking_number?: { tracking_number?: string };
  tracking?: string;
  status: string;
  created_at: string;
  started?: boolean;
  has_driver_assigned?: boolean;
  driver_assigned?: Driver;
  tracker_data?: TrackerData;
  payload?: {
    pickup?: Place;
    dropoff?: Place;
    waypoints?: Place[];
    entities?: Entity[];
  };
  tracking_statuses?: TrackingStatus[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDriverInitials(name?: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

function getSafePhotoUrl(url?: string): string | null {
  if (!url) return null;
  // Filter out local/development URLs that cause mixed content on HTTPS
  if (url.includes('127.0.0.1') || url.includes('localhost') || url.startsWith('http://')) {
    return null;
  }
  return url;
}

function formatEta(seconds?: number) {
  if (!seconds) return "Calculating...";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

function TrackPageInner() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoLooked = useRef(false);

  const lookupOrder = useCallback(async (tracking: string) => {
    if (!tracking) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?tracking=${encodeURIComponent(tracking)}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set("order", tracking);
      window.history.replaceState({}, "", url.toString());
    } catch (_err) {
      setError("Could not find that order. Please check the tracking number.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-lookup on mount if tracking number in URL
  useEffect(() => {
    const t = searchParams.get("order");
    if (t && !hasAutoLooked.current) {
      hasAutoLooked.current = true;
      setTrackingNumber(t);
      lookupOrder(t);
    }
  }, [searchParams, lookupOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(trackingNumber);
  };

  const handleNewLookup = () => {
    setOrder(null);
    setError(null);
    setTrackingNumber("");
    const url = new URL(window.location.href);
    url.searchParams.delete("order");
    window.history.replaceState({}, "", url.toString());
  };

  const progressPercent = Math.round(order?.tracker_data?.progress_percentage || 0);
  const circumference = 2 * Math.PI * 42;
  const progressOffset = circumference * (1 - progressPercent / 100);

  // ========== LOOKUP VIEW ==========
  if (!order) {
    return (
      <div className={styles.lookupPage}>
        <div className={styles.lookupCard}>
          <img src="/sefari-logo.svg" alt="SEFARI" className={styles.lookupLogo} style={{width:56,height:56,objectFit:"contain",}} />
          <div className={styles.lookupSubtitle}>Track your delivery in real-time</div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.lookupInput}
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.lookupBtn}
              disabled={!trackingNumber || loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Looking up...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                  </svg>
                  Track Order
                </>
              )}
            </button>
          </form>
          {error && <div className={styles.lookupError}>{error}</div>}
        </div>
      </div>
    );
  }

  // ========== TRACKING VIEW ==========
  const driver = order.driver_assigned;
  const trackingStatuses = order.tracking_statuses || [];
  const entities = order.payload?.entities || [];
  const trackingNum = order.tracking_number?.tracking_number || order.tracking || "";

  // --- Visibility Gates ---
  const STATUS = (order.status || "").toLowerCase();
  const isCompleted = ["completed", "cancelled", "failed"].includes(STATUS);
  const isActive = [
    "in_progress", "driver_enroute", "started", "dispatched",
    "driver_assigned", "enroute", "active"
  ].includes(STATUS);

  // ========== EXPIRED VIEW (completed / cancelled) ==========
  if (isCompleted) {
    return (
      <div className={styles.lookupPage}>
        <div className={styles.lookupCard}>
          <img src="/sefari-logo.svg" alt="SEFARI" className={styles.lookupLogo} style={{width:56,height:56,objectFit:"contain",}} />
          <div className={styles.expiredIcon}>
            <svg width="48" height="48" viewBox="0 0 512 512" fill="currentColor">
              <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zm40-176c-22.1 0-40-17.9-40-40s17.9-40 40-40s40 17.9 40 40s-17.9 40-40 40z"/>
            </svg>
          </div>
          <div className={styles.expiredTitle}>This tracking link has expired</div>
          <div className={styles.expiredSubtitle}>
            {STATUS === "cancelled" ? "This order was cancelled." : "Your order has been delivered. Thank you for choosing SEFARI!"}
          </div>
          <div className={styles.expiredOrder}>Order #{trackingNum}</div>
          <button className={styles.lookupBtn} onClick={handleNewLookup}>
            Track Another Order
          </button>
        </div>
      </div>
    );
  }

  // ========== NOT STARTED YET VIEW ==========
  if (!isActive) {
    return (
      <div className={styles.lookupPage}>
        <div className={styles.lookupCard}>
          <img src="/sefari-logo.svg" alt="SEFARI" className={styles.lookupLogo} style={{width:56,height:56,objectFit:"contain",}} />
          <div className={styles.pendingIcon}>
            <svg width="48" height="48" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.5 33.3-6.5s4.5-25.9-6.5-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
            </svg>
          </div>
          <div className={styles.expiredTitle}>Preparing your order</div>
          <div className={styles.expiredSubtitle}>
            Live tracking will appear here once your driver is on the way. Check back soon!
          </div>
          <div className={styles.expiredOrder}>Order #{trackingNum} &bull; Status: {order.status}</div>
          <button className={styles.lookupBtn} onClick={() => lookupOrder(trackingNum)}>
            <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" style={{marginRight:6}}>
              <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 .1 0 .1 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
            </svg>
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* SVG Gradient Definition */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <img src="/sefari-logo.svg" alt="SEFARI" className={styles.headerLogo} style={{width:32,height:32,objectFit:"contain",}} />
          <div className={styles.headerOrder}>
            <span>Order</span>
            <span className={styles.headerOrderId}>{trackingNum}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.statusBadge}>{order.status}</span>
          <button className={styles.newLookupBtn} onClick={handleNewLookup}>
            <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 .1 0 .1 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
            </svg>
            New Lookup
          </button>
        </div>
      </header>

      {/* Hero Map */}
      <div className={styles.heroMap}>
        <TrackingMap
          order={order}
          driver={driver}
        />
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoGlass}>
          {/* Status Bar */}
          <div className={styles.statusBar}>
            <div className={styles.statusInfo}>
              <div className={`${styles.statusDot} ${!order.started ? styles.statusDotInactive : ""}`} />
              <div className={styles.statusText}>{order.status}</div>
            </div>
            <div className={styles.statusDate}>{formatDateShort(order.created_at)}</div>
          </div>

          {/* Two-Column Content */}
          <div className={styles.content}>
            {/* Left: Progress + Driver */}
            <div className={styles.progressCol}>
              {/* Progress Ring + ETA */}
              <div className={styles.progressSection}>
                <div className={styles.ringWrapper}>
                  <svg className={styles.ring} viewBox="0 0 100 100">
                    <circle className={styles.ringBg} cx="50" cy="50" r="42" />
                    <circle
                      className={styles.ringFill}
                      cx="50" cy="50" r="42"
                      strokeDasharray={circumference}
                      strokeDashoffset={progressOffset}
                    />
                  </svg>
                  <div className={styles.ringText}>{progressPercent}%</div>
                </div>
                <div className={styles.etaBlock}>
                  <div className={styles.etaLabel}>Estimated Arrival</div>
                  <div className={styles.etaValue}>{formatEta(order.tracker_data?.current_destination_eta)}</div>
                  <div className={styles.etaSub}>{order.tracker_data?.estimated_completion_time_formatted || ""}</div>
                </div>
              </div>

              {/* Destination */}
              <div className={styles.destCard}>
                <div className={styles.destLabel}>
                  <svg width="12" height="12" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                  </svg>
                  Current Destination
                </div>
                <div className={styles.destAddress}>
                  {order.tracker_data?.current_destination?.address || order.payload?.dropoff?.address || "Awaiting destination"}
                </div>
              </div>

              {/* Driver Card */}
              {driver ? (
                <div className={styles.driverCard}>
                  <div className={styles.driverAvatar}>
                    {getSafePhotoUrl(driver.photo_url) ? (
                      <img src={getSafePhotoUrl(driver.photo_url)!} alt={driver.name} />
                    ) : (
                      getDriverInitials(driver.name)
                    )}
                  </div>
                  <div className={styles.driverInfo}>
                    <div className={styles.driverName}>{driver.name}</div>
                    <div className={styles.driverVehicle}>
                      <svg width="12" height="12" viewBox="0 0 640 512" fill="currentColor">
                        <path d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM160 464a48 48 0 1 1 0-96 48 48 0 1 1 0 96zm368-48a48 48 0 1 1 -96 0 48 48 0 1 1 96 0z"/>
                      </svg>
                      {driver.vehicle_name || "Driver"}
                    </div>
                  </div>
                  <div className={`${styles.driverStatus} ${driver.online ? styles.driverOnline : styles.driverOffline}`}>
                    {driver.online ? "Online" : "Offline"}
                  </div>
                </div>
              ) : (
                <div className={styles.noDriver}>
                  <svg width="28" height="28" viewBox="0 0 640 512" fill="currentColor" style={{ opacity: 0.4, margin: "0 auto 8px" }}>
                    <path d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM160 464a48 48 0 1 1 0-96 48 48 0 1 1 0 96zm368-48a48 48 0 1 1 -96 0 48 48 0 1 1 96 0z"/>
                  </svg>
                  No driver assigned yet
                </div>
              )}
            </div>

            {/* Right: Timeline */}
            <div className={styles.timelineCol}>
              <div className={styles.timelineHeader}>Activity Timeline</div>
              <div className={styles.timeline}>
                {trackingStatuses.length > 0 ? (
                  trackingStatuses.map((ts, i) => {
                    const cls =
                      i === trackingStatuses.length - 1
                        ? styles.timelineCurrent
                        : styles.timelineCompleted;
                    return (
                      <div
                        key={i}
                        className={`${styles.timelineItem} ${cls}`}
                        style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                      >
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineStatus}>{ts.status}</div>
                        <div className={styles.timelineDetail}>{ts.details || ""}</div>
                        <div className={styles.timelineTime}>{formatDateTime(ts.created_at)}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className={`${styles.timelineItem} ${styles.timelineCompleted}`}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineStatus}>Order Created</div>
                    <div className={styles.timelineDetail}>Your order is being processed</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          {entities.length > 0 && (
            <div className={styles.itemsSection}>
              <div className={styles.itemsHeader}>Package Details</div>
              {entities.map((entity, i) => (
                <div key={i} className={styles.item}>
                  <div className={styles.itemImage}>
                    {entity.photo_url && <img src={entity.photo_url} alt={entity.name || ""} />}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{entity.name || `Item ${i + 1}`}</div>
                    <div className={styles.itemTracking}>{entity.tracking || "No tracking"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js 14 (useSearchParams requirement)
export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className={styles.lookupPage}>
        <div className={styles.lookupCard}>
          <img src="/sefari-logo.svg" alt="SEFARI" className={styles.lookupLogo} style={{width:56,height:56,objectFit:"contain",}} />
          <div className={styles.lookupSubtitle}>Loading...</div>
        </div>
      </div>
    }>
      <TrackPageInner />
    </Suspense>
  );
}
