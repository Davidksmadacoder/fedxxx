"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Center,
  Group,
  Table,
  Text,
  Title,
  Tooltip,
  Button,
  Modal,
  Menu,
  TextInput,
  Divider,
  SimpleGrid,
  ScrollArea,
  Accordion,
} from "@mantine/core";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/api/axios";
import { IParcel } from "@/lib/models/parcel.model";
import Logo from "@/components/common/Logo";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  LuPackageSearch,
  LuActivity,
  LuClock3,
  LuTrendingUp,
  LuSearch,
  LuEye,
  LuExternalLink,
  LuCopy,
  LuImage,
  LuMap,
} from "react-icons/lu";
import { RiMapPinTimeLine } from "react-icons/ri";
import { FaEllipsisV } from "react-icons/fa";
import CustomLoader from "@/components/features/CustomLoader";

/* ----------------------------- Status coloring ----------------------------- */
type StatusKey =
  | "PENDING"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "CUSTOMS"
  | "DELIVERED"
  | "CANCELLED"
  | string;

const STATUS_COLOR: Partial<Record<StatusKey, string>> = {
  PENDING: "gray",
  DISPATCHED: "blue",
  IN_TRANSIT: "indigo",
  ARRIVED: "yellow",
  CUSTOMS: "orange",
  DELIVERED: "green",
  CANCELLED: "red",
};

/* ------------------------------- Safe Image -------------------------------- */
const FALLBACK_SVG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="18" font-family="Arial, sans-serif">
        Image unavailable
      </text>
    </svg>`
  );

function SafeImage({
  src,
  alt,
  className = "",
  height = 180,
}: {
  src: string;
  alt: string;
  className?: string;
  height?: number;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImgSrc(FALLBACK_SVG)}
      className={`w-full rounded-xl object-cover !filter-none !invert-0 !mix-blend-normal ${className}`}
      style={{ height }}
    />
  );
}

/* --------------------- Image URL: safe normalizer helper -------------------- */
/** Accepts string or common asset shapes and returns a usable URL (or null). */
function toImageUrl(
  x:
    | string
    | (Record<string, any> & {
      url?: string;
      secure_url?: string;
      src?: string;
      path?: string;
      original?: string;
      publicId?: string;
      public_id?: string;
      format?: string;
    })
): string | null {
  if (!x) return null;
  if (typeof x === "string") return x.trim() || null;

  // Try common keys first
  if (typeof x.url === "string" && x.url) return x.url;
  if (typeof x.secure_url === "string" && x.secure_url) return x.secure_url;
  if (typeof x.src === "string" && x.src) return x.src;
  if (typeof x.path === "string" && x.path) return x.path;
  if (typeof x.original === "string" && x.original) return x.original;

  // Cloudinary-like fallback: public_id + format
  const pid = (x.publicId || x.public_id) as string | undefined;
  if (pid) {
    const fmt = (x.format as string | undefined) || "jpg";
    // NOTE: If you have a known delivery base, place it here.
    // Otherwise return null to avoid broken links.
    // Example (uncomment and customize):
    // return `https://res.cloudinary.com/<cloud_name>/image/upload/${pid}.${fmt}`;
    return null;
  }

  return null;
}

/* ------------------------------- TM details -------------------------------- */
interface ITransportMeansFull {
  _id: string;
  name: string;
  type: string;
  description?: string;
  capacity: number;
  estimatedTime: string;
  costPerKm: number;
  active: boolean;
  availabilityDate: string | Date;
  lastMaintenanceDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* --------------------------------- Utils ---------------------------------- */
const dayMs = 86400000;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const ratio = (num: number, den: number) => (den ? num / den : 0);
const fmtDateTime = (d?: string | Date) =>
  d ? new Date(d).toLocaleString() : "—";

function median(values: number[]) {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

/* ------------------------------- Sparkline -------------------------------- */
const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  const w = 160;
  const h = 40;
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const stepX = w / (values.length - 1 || 1);

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = h - (v / max) * (h - 2) - 1;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} className="block">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity={0.9}
      />
    </svg>
  );
};

/* ------------------------------ Styled Tiles ------------------------------ */
const Tile: React.FC<
  React.PropsWithChildren<{ title: string; icon?: React.ReactNode; right?: React.ReactNode }>
> = ({ title, children, icon, right }) => {
  return (
    <div
      className="rounded-2xl p-4 border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg"
      style={{ background: "var(--card-bg, transparent)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <div className="opacity-80">{icon}</div> : null}
          <Text size="sm" c="dimmed">
            {title}
          </Text>
        </div>
        {right}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default function AdminOverview() {
  const [loading, setLoading] = useState(false);
  const [parcels, setParcels] = useState<IParcel[]>([]);
  const [keyOpen, setKeyOpen] = useState(false);

  // UI state
  const [search, setSearch] = useState("");
  const [detailsParcel, setDetailsParcel] = useState<IParcel | null>(null);

  // Transport Means detail fetch state
  const [tmLoading, setTmLoading] = useState(false);
  const [tmDetails, setTmDetails] = useState<ITransportMeansFull | null>(null);

  /* --------------------------------- Data --------------------------------- */
  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      try {
        const res = await api.get("/parcel");
        setParcels(res.data?.parcels ?? []);
      } catch {
        toast.error("Failed to load parcels");
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  /* ------------------------------- Analytics ------------------------------- */
  const analytics = useMemo(() => {
    const now = new Date();
    const total = parcels.length;

    // status counts
    const byStatus: Record<string, number> = {};
    for (const p of parcels) {
      const s = (p.currentStatus as StatusKey) ?? "UNKNOWN";
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    }

    // delivered stats
    const delivered = parcels.filter((p) => p.currentStatus === "DELIVERED");
    const deliveredRatio = ratio(delivered.length, total);

    // average & median delivery time (days)
    const times = delivered
      .map((p) => {
        const end = p.actualDeliveryDate ? new Date(p.actualDeliveryDate) : null;
        const start = p.pickupDate ? new Date(p.pickupDate) : null;
        if (!end || !start) return NaN;
        return (end.getTime() - start.getTime()) / dayMs;
      })
      .filter((n) => Number.isFinite(n) && n >= 0) as number[];
    const avgDays = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const medDays = median(times);

    // on-time rate (delivered where actual <= ETA)
    const onTime = delivered.filter((p) => {
      if (!p.actualDeliveryDate || !p.estimatedDeliveryDate) return false;
      return new Date(p.actualDeliveryDate).getTime() <= new Date(p.estimatedDeliveryDate).getTime();
    }).length;
    const onTimeRate = ratio(onTime, delivered.length);

    // at-risk: ETA passed & not delivered/cancelled
    const atRisk = parcels.filter((p) => {
      if (!p.estimatedDeliveryDate) return false;
      const eta = new Date(p.estimatedDeliveryDate);
      return eta.getTime() < now.getTime() && !["DELIVERED", "CANCELLED"].includes(p.currentStatus as string);
    }).length;

    // "in transit" group
    const inTransit =
      (byStatus["DISPATCHED"] ?? 0) +
      (byStatus["IN_TRANSIT"] ?? 0) +
      (byStatus["ARRIVED"] ?? 0) +
      (byStatus["CUSTOMS"] ?? 0);

    // sparkline data: last 14 days creation counts
    const created = parcels.map((p) => new Date(p.createdAt).getTime());
    const nowMs = now.getTime();
    const rangeCount = (start: number, end: number) =>
      created.filter((t) => t >= start && t < end).length;

    const days = [...Array(14)].map((_, i) => {
      const start = new Date(nowMs - (13 - i) * dayMs);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + dayMs);
      return rangeCount(start.getTime(), end.getTime());
    });

    return {
      total,
      byStatus,
      deliveredRatio,
      avgDays,
      medDays,
      onTimeRate,
      onTime,
      atRisk,
      inTransit,
      spark14: days,
    };
  }, [parcels]);

  /* -------------------------- Table data + filtering ------------------------ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parcels;
    return parcels.filter((p) => {
      const sender = (p.sender?.name ?? "").toLowerCase();
      const receiver = (p.receiver?.name ?? "").toLowerCase();
      const tid = (p.trackingId ?? "").toLowerCase();
      const status = (p.currentStatus ?? "").toLowerCase();
      return tid.includes(q) || sender.includes(q) || receiver.includes(q) || status.includes(q);
    });
  }, [parcels, search]);

  const tableRows = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [filtered]
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const openDetails = async (p: IParcel) => {
    setDetailsParcel(p);
    setTmDetails(null);

    // Attempt to enrich transport means if we only have an id/slim object
    const tmRef: any = p.transportMeans;
    const id =
      typeof tmRef === "string" ? tmRef : (tmRef?._id as string | undefined);

    if (id) {
      setTmLoading(true);
      try {
        const res = await api.get(`/transportMeans/${id}`);
        const tm: ITransportMeansFull = res.data.transportMeans ?? res.data;
        if (tm && tm._id) setTmDetails(tm);
      } catch {
        // Silently ignore; we'll still show whatever we have
      } finally {
        setTmLoading(false);
      }
    }
  };

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="admin-page-container custom-black-white-theme-switch-bg">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Monitor shipments, track analytics, and manage your logistics operations from a single dashboard."
        breadcrumbs={[{ label: "Admin Dashboard" }]}
        searchProps={{
          value: search,
          onChange: (e) => setSearch(e.currentTarget.value),
          placeholder: "Search parcels by tracking ID, sender, receiver, or status",
        }}
      />
      <CustomLoader loading={loading} />

      {/* Secondary Action */}
      <div className="mb-6 flex justify-end">
        <Button component={Link} href="/admin-dashboard/parcels" color="brandOrange" size="md">
          Manage Parcels
        </Button>
      </div>

      {/* Empty state */}
      {!loading && parcels.length === 0 ? (
        <Center className="py-20">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl flex items-center justify-center bg-[var(--bg-general-light)]/60">
              <LuPackageSearch className="h-8 w-8 opacity-70" />
            </div>
            <h3 className="text-lg font-semibold mb-1 custom-black-white-theme-switch-text">
              No parcels found
            </h3>
            <p className="text-sm text-gray-500">
              When shipments start flowing, you’ll see live analytics, trends, and recent activity here.
            </p>
          </div>
        </Center>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Tile title="Total Parcels" icon={<LuActivity />} right={<Badge variant="light">last 14d</Badge>}>
              <Title order={2}>{analytics.total}</Title>
              <div className="mt-2 opacity-80">
                <Sparkline values={analytics.spark14} />
              </div>
            </Tile>

            <Tile title="In Transit" icon={<LuActivity />}>
              <Title order={2}>{analytics.inTransit}</Title>
              <Text size="xs" c="dimmed" className="mt-1">
                dispatched • in-transit • arrived • customs
              </Text>
            </Tile>

            <Tile title="Delivered Ratio" icon={<LuTrendingUp />}>
              <Title order={2}>{pct(analytics.deliveredRatio)}</Title>
              <Text size="xs" c="dimmed" className="mt-1">
                {analytics.onTime} on time • {pct(analytics.onTimeRate)}
              </Text>
            </Tile>

            <Tile title="Avg Delivery Time" icon={<LuClock3 />}>
              <Title order={2}>{analytics.avgDays.toFixed(1)}d</Title>
              <Text size="xs" c="dimmed" className="mt-1">
                median {analytics.medDays.toFixed(1)}d
              </Text>
            </Tile>
          </div>

          {/* Status Breakdown */}
          <div
            className="rounded-2xl p-4 border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg mb-6"
            style={{ background: "var(--card-bg, transparent)" }}
          >
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <Title order={4}>Status Breakdown</Title>
                <Button variant="subtle" size="xs" onClick={() => setKeyOpen(true)}>
                  status key
                </Button>
              </Group>
              <Button component={Link} href="/admin-dashboard/parcels" variant="light" color="brandOrange" size="xs">
                View all
              </Button>
            </Group>

            <Group mt="sm" gap="xs">
              <Badge variant="dot" color="red">
                At-risk: {analytics.atRisk}
              </Badge>
              <Badge variant="outline" color="gray">
                Open/pending:{" "}
                {analytics.total -
                  (analytics.byStatus["DELIVERED"] ?? 0) -
                  (analytics.byStatus["CANCELLED"] ?? 0)}
              </Badge>
            </Group>
          </div>

          {/* Recent Parcels (borderless, menu actions) */}
          <div
            className="rounded-2xl p-4 border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg"
            style={{ background: "var(--card-bg, transparent)" }}
          >
            <Group justify="space-between" mb="md" align="end">
              <div>
                <Title order={4}>Recent Parcels</Title>
                <Text size="xs" c="dimmed">
                  showing {tableRows.length} of {filtered.length} match{filtered.length === 1 ? "" : "es"}
                </Text>
              </div>
              <Group gap="xs">
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder="Search by tracking ID, name, or status"
                  leftSection={<LuSearch size={16} />}
                  miw={280}
                />
                <Button component={Link} href="/admin-dashboard/parcels" variant="light" color="brandOrange">
                  View all
                </Button>
              </Group>
            </Group>

            <Table.ScrollContainer minWidth={700} className="custom_table_scroll">
              <Table
                highlightOnHover
                withRowBorders={false}
                withColumnBorders={false}
                className="custom_table borderless"
                data={{
                  head: ["Tracking ID", "Sender → Receiver", "Status", "Actions"],
                  body: tableRows.map((p) => [
                    p.description ? (
                      <Tooltip key="tid-tp" label={p.description} withArrow>
                        <Text span fw={600} style={{ textDecoration: "underline" }}>
                          {p.trackingId}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text key="tid" span fw={600}>
                        {p.trackingId}
                      </Text>
                    ),
                    `${p.sender?.name ?? "—"} → ${p.receiver?.name ?? "—"}`,
                    <Badge
                      key="status"
                      variant="light"
                      color={STATUS_COLOR[p.currentStatus as StatusKey] ?? "gray"}
                    >
                      {p.currentStatus ?? "—"}
                    </Badge>,
                    <Menu key={`${p._id}-menu`} shadow="md" width={240} position="bottom-end" withinPortal>
                      <Menu.Target>
                        <Button variant="subtle" size="xs">
                          <FaEllipsisV />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<LuEye />} onClick={() => openDetails(p)}>
                          View details
                        </Menu.Item>
                        <Menu.Item leftSection={<LuCopy />} onClick={() => copy(p.trackingId)}>
                          Copy tracking ID
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>,
                  ]),
                }}
              />
            </Table.ScrollContainer>
          </div>
        </>
      )}

      {/* Status Key Modal */}
      <Modal opened={keyOpen} onClose={() => setKeyOpen(false)} title={<Logo size="large" />} centered>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              "PENDING",
              "DISPATCHED",
              "IN_TRANSIT",
              "ARRIVED",
              "CUSTOMS",
              "DELIVERED",
              "CANCELLED",
            ] as StatusKey[]
          ).map((k) => (
            <Group key={k} gap="xs">
              <Badge color={STATUS_COLOR[k] ?? "gray"} variant="light">
                {k}
              </Badge>
              <Text size="sm" c="dimmed">
                {k.replaceAll("_", " ").toLowerCase()}
              </Text>
            </Group>
          ))}
        </div>
      </Modal>

      {/* Details Modal — FULL parcel data */}
      <Modal
        opened={!!detailsParcel}
        onClose={() => {
          setDetailsParcel(null);
          setTmDetails(null);
        }}
        centered
        size="xl"
        title={
          <Group gap="sm" align="center">
            <Logo size="large" />
            <Text fw={700} size="lg">
              {detailsParcel ? `Parcel — ${detailsParcel.trackingId}` : "Parcel details"}
            </Text>
            {detailsParcel && (
              <Badge variant="light" color={STATUS_COLOR[detailsParcel.currentStatus as StatusKey] ?? "gray"}>
                {detailsParcel.currentStatus}
              </Badge>
            )}
          </Group>
        }
      >
        {detailsParcel && (
          <ScrollArea.Autosize mah="72vh" type="auto">
            {/* Summary */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} className="mb-3">
              <div>
                <Text size="sm" c="dimmed">Tracking ID</Text>
                <Group gap="xs">
                  <Text fw={600}>{detailsParcel.trackingId}</Text>
                  <Button size="xs" variant="subtle" onClick={() => copy(detailsParcel.trackingId)}>
                    copy
                  </Button>
                </Group>
              </div>
              <div>
                <Text size="sm" c="dimmed">Created</Text>
                <Text>{fmtDateTime(detailsParcel.createdAt)}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Updated</Text>
                <Text>{fmtDateTime(detailsParcel.updatedAt)}</Text>
              </div>
            </SimpleGrid>

            <Divider my="sm" />

            {/* Shipping / Package */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} className="mb-3">
              <div>
                <Text size="sm" c="dimmed">Pickup</Text>
                <Text>{fmtDateTime(detailsParcel.pickupDate)}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">ETA</Text>
                <Text>{fmtDateTime(detailsParcel.estimatedDeliveryDate)}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Delivered</Text>
                <Text>{fmtDateTime(detailsParcel.actualDeliveryDate)}</Text>
              </div>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} className="mb-3">
              <div>
                <Text size="sm" c="dimmed">From</Text>
                <Text>{detailsParcel.fromLocation || "—"}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">To</Text>
                <Text>{detailsParcel.toLocation || "—"}</Text>
              </div>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 3 }} className="mb-3">
              <div>
                <Text size="sm" c="dimmed">Weight</Text>
                <Text>{detailsParcel.weight ?? "—"}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Dimensions</Text>
                <Text>{detailsParcel.dimensions || "—"}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Description</Text>
                <Text>{detailsParcel.description || "—"}</Text>
              </div>
            </SimpleGrid>

            <Divider my="sm" />

            {/* Transport Means */}
            <div className="mb-3">
              <Group mb={6}>
                <LuExternalLink />
                <Text fw={600}>Transport Means</Text>
                {tmLoading && <Badge variant="light">loading…</Badge>}
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <div>
                  <Text size="sm" c="dimmed">Name</Text>
                  <Text fw={600}>
                    {tmDetails?.name ||
                      (typeof (detailsParcel.transportMeans as any)?.name === "string"
                        ? (detailsParcel.transportMeans as any).name
                        : typeof detailsParcel.transportMeans === "string"
                          ? "—"
                          : (detailsParcel.transportMeans as any)?.name || "—")}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Type</Text>
                  <Text>
                    {tmDetails?.type ||
                      (typeof (detailsParcel.transportMeans as any)?.type === "string"
                        ? (detailsParcel.transportMeans as any).type
                        : "—")}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Status</Text>
                  <Badge color={tmDetails?.active ? "green" : "red"} variant="light">
                    {tmDetails?.active ? "Active" : tmDetails ? "Inactive" : "—"}
                  </Badge>
                </div>
              </SimpleGrid>

              {tmDetails && (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} mt="sm">
                    <div>
                      <Text size="sm" c="dimmed">Capacity</Text>
                      <Text>{tmDetails.capacity}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Estimated Time</Text>
                      <Text>{tmDetails.estimatedTime}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Cost per Km</Text>
                      <Text>{tmDetails.costPerKm}</Text>
                    </div>
                  </SimpleGrid>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                    <div>
                      <Text size="sm" c="dimmed">Availability</Text>
                      <Text>{fmtDateTime(tmDetails.availabilityDate)}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Last Maintenance</Text>
                      <Text>{fmtDateTime(tmDetails.lastMaintenanceDate)}</Text>
                    </div>
                  </SimpleGrid>

                  {(tmDetails.description || tmDetails.createdAt || tmDetails.updatedAt) && (
                    <>
                      <Divider my="sm" />
                      <SimpleGrid cols={{ base: 1, sm: 3 }}>
                        <div className="sm:col-span-3">
                          <Text size="sm" c="dimmed">Description</Text>
                          <Text>{tmDetails.description || "—"}</Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed">TM Created</Text>
                          <Text>{fmtDateTime(tmDetails.createdAt)}</Text>
                        </div>
                        <div>
                          <Text size="sm" c="dimmed">TM Updated</Text>
                          <Text>{fmtDateTime(tmDetails.updatedAt)}</Text>
                        </div>
                      </SimpleGrid>
                    </>
                  )}
                </>
              )}
            </div>

            <Divider my="sm" />

            {/* Contacts */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} className="mb-3">
              <div>
                <Text fw={600} mb={6}>Sender</Text>
                <Accordion variant="separated">
                  <Accordion.Item value="sender">
                    <Accordion.Control>
                      {detailsParcel.sender?.name} • {detailsParcel.sender?.email}
                    </Accordion.Control>
                    <Accordion.Panel>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <div><Text size="sm" c="dimmed">Name</Text><Text>{detailsParcel.sender?.name}</Text></div>
                        <div><Text size="sm" c="dimmed">Email</Text><Text>{detailsParcel.sender?.email}</Text></div>
                        <div><Text size="sm" c="dimmed">Phone</Text><Text>{detailsParcel.sender?.phone}</Text></div>
                        <div><Text size="sm" c="dimmed">Address</Text><Text>{detailsParcel.sender?.address}</Text></div>
                        <div><Text size="sm" c="dimmed">City</Text><Text>{detailsParcel.sender?.city}</Text></div>
                        <div><Text size="sm" c="dimmed">State</Text><Text>{detailsParcel.sender?.state}</Text></div>
                        <div><Text size="sm" c="dimmed">Postal Code</Text><Text>{detailsParcel.sender?.postalCode}</Text></div>
                        <div><Text size="sm" c="dimmed">Country</Text><Text>{detailsParcel.sender?.country}</Text></div>
                      </SimpleGrid>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </div>

              <div>
                <Text fw={600} mb={6}>Receiver</Text>
                <Accordion variant="separated">
                  <Accordion.Item value="receiver">
                    <Accordion.Control>
                      {detailsParcel.receiver?.name} • {detailsParcel.receiver?.email}
                    </Accordion.Control>
                    <Accordion.Panel>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <div><Text size="sm" c="dimmed">Name</Text><Text>{detailsParcel.receiver?.name}</Text></div>
                        <div><Text size="sm" c="dimmed">Email</Text><Text>{detailsParcel.receiver?.email}</Text></div>
                        <div><Text size="sm" c="dimmed">Phone</Text><Text>{detailsParcel.receiver?.phone}</Text></div>
                        <div><Text size="sm" c="dimmed">Address</Text><Text>{detailsParcel.receiver?.address}</Text></div>
                        <div><Text size="sm" c="dimmed">City</Text><Text>{detailsParcel.receiver?.city}</Text></div>
                        <div><Text size="sm" c="dimmed">State</Text><Text>{detailsParcel.receiver?.state}</Text></div>
                        <div><Text size="sm" c="dimmed">Postal Code</Text><Text>{detailsParcel.receiver?.postalCode}</Text></div>
                        <div><Text size="sm" c="dimmed">Country</Text><Text>{detailsParcel.receiver?.country}</Text></div>
                      </SimpleGrid>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </div>
            </SimpleGrid>

            {/* Images */}
            {Array.isArray(detailsParcel.imageUrls) && detailsParcel.imageUrls.length ? (
              <>
                <Divider my="sm" />
                <Group mb={8}>
                  <LuImage />
                  <Text fw={600}>Package Images</Text>
                  <Badge variant="light">{detailsParcel.imageUrls.length}</Badge>
                </Group>

                {/*
                  Normalize any asset shape → string URL, filter out nulls,
                  then render with proper string types for <a href> and <img src>.
                */}
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                  {detailsParcel.imageUrls
                    .map((asset) => toImageUrl(asset as any))
                    .filter((u): u is string => typeof u === "string" && u.length > 0)
                    .map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noreferrer" className="block">
                        <SafeImage src={u} alt={`image ${i + 1}`} height={140} />
                      </a>
                    ))}
                </SimpleGrid>
              </>
            ) : null}

            {/* Timeline */}
            {detailsParcel.timelines?.length ? (
              <>
                <Divider my="sm" />
                <Group mb={8}>
                  <RiMapPinTimeLine />
                  <Text fw={600}>Shipment Timeline</Text>
                  <Badge variant="light">{detailsParcel.timelines.length}</Badge>
                </Group>
                <div className="space-y-6">
                  {[...detailsParcel.timelines]
                    .sort((a, b) => new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime())
                    .map((t, idx) => (
                      <div key={idx} className="rounded-xl p-12px">
                        <Group justify="space-between" align="start" mb={4}>
                          <Group gap="xs">
                            <Badge
                              variant="light"
                              color={STATUS_COLOR[t.status as StatusKey] ?? "gray"}
                            >
                              {t.status}
                            </Badge>
                            {t.sendEmail && <Badge color="green">Notified</Badge>}
                          </Group>
                          <Text size="sm" c="dimmed">{fmtDateTime(t.timelineDate)}</Text>
                        </Group>
                        <Text className="mb-1">{t.message}</Text>
                        {t.location && (
                          <Text size="sm" c="dimmed">
                            Location: {t.location}
                          </Text>
                        )}
                        <Divider mt="sm" />
                      </div>
                    ))}
                </div>
              </>
            ) : null}

            {/* Live Routes */}
            {detailsParcel.liveRoutes?.length ? (
              <>
                <Divider my="sm" />
                <Group mb={8}>
                  <LuMap />
                  <Text fw={600}>Live Routes</Text>
                  <Badge variant="light">{detailsParcel.liveRoutes.length}</Badge>
                </Group>
                <Table.ScrollContainer minWidth={700}>
                  <Table withColumnBorders={false} withRowBorders highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Latitude</Table.Th>
                        <Table.Th>Longitude</Table.Th>
                        <Table.Th>Timestamp</Table.Th>
                        <Table.Th>Visible</Table.Th>
                        <Table.Th>Notified</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {[...detailsParcel.liveRoutes]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((r, i) => (
                          <Table.Tr key={i}>
                            <Table.Td>{r.latitude}</Table.Td>
                            <Table.Td>{r.longitude}</Table.Td>
                            <Table.Td>{fmtDateTime(r.timestamp)}</Table.Td>
                            <Table.Td>
                              <Badge variant="light" color={r.visible ? "green" : "gray"}>
                                {r.visible ? "Yes" : "No"}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge variant="light" color={r.sendEmail ? "green" : "gray"}>
                                {r.sendEmail ? "Yes" : "No"}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </>
            ) : null}
          </ScrollArea.Autosize>
        )}
      </Modal>
    </div>
  );
}
