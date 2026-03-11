import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, Link, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import { Slot, Label as Label$1, Select as Select$1 } from "radix-ui";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const host = "https://tradingservice-api.harrisowe.me";
const webSocketHost = "wss://tradingservice-api.harrisowe.me/ws";
const useStockStore = create((set, get) => ({
  user: {},
  webSocket: null,
  webSocketMessageHandler: (event) => {
    try {
      const json = JSON.parse(event.data);
      console.log(json);
      if (json.tag == "stocks") {
        set({ stocks: json.content });
      } else if (json.tag == "notification") {
        set({ notification: json.content });
      }
    } catch (error) {
      console.error(error);
    }
  },
  establishWebSocket: () => {
    const socket = new WebSocket(webSocketHost);
    socket.addEventListener("open", (event) => {
      socket.send("1");
    });
    socket.addEventListener("message", get().webSocketMessageHandler);
    set({ webSocket: socket });
  },
  stocks: [],
  pendingTrades: [],
  trades: [],
  fetchStocks: async () => {
    const response = await fetch(`${host}/stock`);
    if (!response.ok) {
      console.error("Error fetching stocks");
    } else {
      const stocks = await response.json();
      console.log(stocks);
      set({ stocks });
    }
  },
  fetchTrades: async () => {
    const response = await fetch(`${host}/trades?userId=${get().user.id ?? 1}`);
    if (!response.ok) {
      console.error("Error fetching trades");
    } else {
      const trades2 = await response.json();
      console.log(trades2);
      set({ trades: trades2 });
    }
  },
  fetchPendingTrades: async () => {
    const response = await fetch(`${host}/trades/pending?userId=${get().user.id ?? 1}`);
    if (!response.ok) {
      console.error("Error fetching pending trades");
    } else {
      const trades2 = await response.json();
      console.log(trades2);
      set({ pendingTrades: trades2 });
    }
  },
  queueTrade: async (tradeRequest) => {
    tradeRequest["userId"] = get().user.id;
    const response = await fetch(`${host}/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tradeRequest)
    });
    if (!response.ok) {
      console.error("Error submitting stock request");
      return false;
    } else {
      const json = await response.json();
      return json;
    }
  },
  fetchUser: async () => {
    const response = await fetch(`${host}/user/1`, {
      METHOD: "POST"
    });
    if (!response.ok) {
      console.error("failed to fetch user");
    } else {
      const user2 = await response.json();
      console.log(user2);
      set({ user: user2 });
    }
  },
  notification: null,
  clearNotification: () => {
    set({ notification: null });
  }
}));
function Header() {
  const user2 = useStockStore((state) => state.user);
  const notification = useStockStore((state) => state.notification);
  const clearNotification = useStockStore((state) => state.clearNotification);
  useEffect(() => {
    if (notification != null) {
      setTimeout(clearNotification, 5e3);
    }
  }, [notification]);
  return /* @__PURE__ */ jsxs("div", { className: "h-10 bg-blue-100 flex justify-between content-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "p-1", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/trades", className: "p-1", children: "Trade History" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("p", { className: "p-1", children: notification || "No Notifications" }),
      /* @__PURE__ */ jsx(Link, { to: "/user", className: "p-1", children: user2?.name ?? "Logged Out" })
    ] })
  ] });
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  const fetchUser = useStockStore((state) => state.fetchUser);
  const fetchStocks = useStockStore((state) => state.fetchStocks);
  const establishWebSocket = useStockStore((state) => state.establishWebSocket);
  useEffect(() => {
    fetchUser();
    establishWebSocket();
    fetchStocks();
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("div", {
      className: "w-80/100 m-auto",
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack = "";
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function DataTable({
  columns,
  data
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-md border", children: /* @__PURE__ */ jsxs(Table, { children: [
    /* @__PURE__ */ jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, { children: headerGroup.headers.map((header) => {
      return /* @__PURE__ */ jsx(TableHead, { style: header.column.columnDef.meta?.style, children: header.isPlaceholder ? null : flexRender(
        header.column.columnDef.header,
        header.getContext()
      ) }, header.id);
    }) }, headerGroup.id)) }),
    /* @__PURE__ */ jsx(TableBody, { children: table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
      TableRow,
      {
        "data-state": row.getIsSelected() && "selected",
        children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { style: cell.column.columnDef.meta?.style, children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
      },
      row.id
    )) : /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: "No results." }) }) })
  ] }) });
}
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const columnDef$2 = [
  {
    accessorKey: "type",
    header: "Ticker"
  },
  {
    accessorKey: "price",
    header: () => /* @__PURE__ */ jsx("div", { className: "text-right", children: "Price" }),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price") / 100);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);
      return /* @__PURE__ */ jsx("div", { className: "text-right font-medium", children: formatted });
    }
  },
  {
    id: "action",
    meta: { style: { width: "1px" } },
    cell: ({ row }) => {
      return /* @__PURE__ */ jsx(Button, { variant: "outline", className: "h-8 p-2", children: /* @__PURE__ */ jsx(Link, { to: `/order/${row.getValue("type")}`, children: "Place Order" }) });
    }
  }
];
function StockDisplay() {
  const stocks = useStockStore((state) => state.stocks);
  return /* @__PURE__ */ jsx(DataTable, { className: "w-md", columns: columnDef$2, data: stocks ?? [] });
}
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(StockDisplay, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label$1.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function FieldGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "field-group",
      className: cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      ),
      ...props
    }
  );
}
const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  }
);
function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className),
      ...props
    }
  );
}
function FieldLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      ),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      ),
      ...props
    }
  );
}
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Root, { "data-slot": "select", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(Select$1.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "pointer-events-none size-4 text-muted-foreground" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Portal, { children: /* @__PURE__ */ jsxs(
    Select$1.Content,
    {
      "data-slot": "select-content",
      "data-align-trigger": position === "item-aligned",
      className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
      position,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          Select$1.Viewport,
          {
            "data-position": position,
            className: cn(
              "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
              position === "popper" && ""
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center", children: /* @__PURE__ */ jsx(Select$1.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "pointer-events-none" }) }) }),
        /* @__PURE__ */ jsx(Select$1.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ChevronUpIcon,
        {}
      )
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ChevronDownIcon,
        {}
      )
    }
  );
}
const order = UNSAFE_withComponentProps(function Order({
  params
}) {
  const stockType = params.type;
  const stock = useStockStore((state) => state.stocks.find((s) => s.type == stockType));
  const queueTrade = useStockStore((state) => state.queueTrade);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock?.price ?? 1);
  const [orderType, setOrderType] = useState("market");
  const [buyOrSell, setBuyOrSell] = useState("buy");
  let navigate = useNavigate();
  if (!stock) {
    return /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("h1", {
        children: "Invalid Stock Choice"
      }), /* @__PURE__ */ jsx(Button, {
        varient: "outline",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          children: "Pick Another"
        })
      })]
    });
  }
  async function submitOrder() {
    const order2 = {
      shares: quantity,
      price: orderType == "market" ? stock.price : price,
      stockType,
      buy: buyOrSell == "buy",
      orderType
    };
    const result = await queueTrade(order2);
    console.log(result);
    if (result) {
      navigate("/user");
    } else {
      alert("Failed to order stock");
    }
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "w-50/100 m-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: stock.type
    }), /* @__PURE__ */ jsxs("p", {
      children: ["$", stock.price / 100]
    }), /* @__PURE__ */ jsxs(FieldGroup, {
      children: [/* @__PURE__ */ jsxs(Field, {
        children: [/* @__PURE__ */ jsx(FieldLabel, {
          htmlFor: "fieldgroup-quantity",
          children: "Quantity"
        }), /* @__PURE__ */ jsx(Input, {
          id: "fieldgroup-quantity",
          type: "number",
          value: quantity,
          onChange: (e) => setQuantity(Number(e.target.value))
        })]
      }), /* @__PURE__ */ jsxs(Field, {
        children: [/* @__PURE__ */ jsx(FieldLabel, {
          htmlFor: "fieldgroup-orderType",
          children: "Order Type"
        }), /* @__PURE__ */ jsxs(Select, {
          value: orderType,
          onValueChange: (e) => setOrderType(e),
          children: [/* @__PURE__ */ jsx(SelectTrigger, {
            id: "fieldgroup-orderType",
            children: /* @__PURE__ */ jsx(SelectValue, {})
          }), /* @__PURE__ */ jsxs(SelectContent, {
            children: [/* @__PURE__ */ jsx(SelectItem, {
              value: "market",
              children: "Market Order"
            }), /* @__PURE__ */ jsx(SelectItem, {
              value: "limit",
              children: "Limit Order"
            })]
          })]
        })]
      }), orderType == "market" ? /* @__PURE__ */ jsx(Fragment, {
        children: /* @__PURE__ */ jsxs(Field, {
          children: [/* @__PURE__ */ jsx(FieldLabel, {
            htmlFor: "fieldgroup-price",
            children: "Price"
          }), /* @__PURE__ */ jsx(Input, {
            id: "fieldgroup-price",
            type: "number",
            value: stock.price / 100,
            disabled: true
          })]
        })
      }) : /* @__PURE__ */ jsx(Fragment, {
        children: /* @__PURE__ */ jsxs(Field, {
          children: [/* @__PURE__ */ jsx(FieldLabel, {
            htmlFor: "fieldgroup-price",
            children: "Price"
          }), /* @__PURE__ */ jsx(Input, {
            id: "fieldgroup-price",
            type: "number",
            value: price / 100,
            onChange: (e) => setPrice(Number(e.target.value) * 100)
          })]
        })
      }), /* @__PURE__ */ jsxs(Field, {
        children: [/* @__PURE__ */ jsx(FieldLabel, {
          htmlFor: "fieldgroup-buySell",
          children: "Buy/Sell"
        }), /* @__PURE__ */ jsxs(Select, {
          value: buyOrSell,
          onValueChange: (e) => setBuyOrSell(e),
          children: [/* @__PURE__ */ jsx(SelectTrigger, {
            id: "fieldgroup-buySell",
            children: /* @__PURE__ */ jsx(SelectValue, {})
          }), /* @__PURE__ */ jsxs(SelectContent, {
            children: [/* @__PURE__ */ jsx(SelectItem, {
              value: "buy",
              children: "Buy"
            }), /* @__PURE__ */ jsx(SelectItem, {
              value: "sell",
              children: "Sell"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx(Button, {
        type: "submit",
        className: "w-25 mt-2",
        onClick: (e) => submitOrder(),
        children: "Submit"
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: order
}, Symbol.toStringTag, { value: "Module" }));
const columnDef$1 = [{
  accessorKey: "type",
  header: "Ticker"
}, {
  accessorKey: "amount",
  header: "Quantity"
}, {
  accessorKey: "price",
  header: () => /* @__PURE__ */ jsx("div", {
    className: "text-right",
    children: "Price"
  }),
  cell: ({
    row
  }) => {
    const amount = parseFloat(row.getValue("price") / 100);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
    return /* @__PURE__ */ jsx("div", {
      className: "text-right font-medium",
      children: formatted
    });
  }
}, {
  id: "action",
  meta: {
    style: {
      width: "1px"
    }
  },
  cell: ({
    row
  }) => {
    return /* @__PURE__ */ jsx(Button, {
      variant: "outline",
      className: "h-8 p-2",
      children: /* @__PURE__ */ jsx(Link, {
        to: `/order/${row.getValue("type")}`,
        children: "Place Order"
      })
    });
  }
}];
const pendingColumnDef = [{
  id: "type",
  header: "Ticker",
  cell: ({
    row
  }) => {
    return /* @__PURE__ */ jsx("div", {
      className: "text-left font-medium",
      children: row.original.stock.type
    });
  }
}, {
  accessorKey: "shares",
  header: "Quantity"
}, {
  accessorKey: "price",
  header: () => /* @__PURE__ */ jsx("div", {
    className: "text-right",
    children: "Price"
  }),
  cell: ({
    row
  }) => {
    const amount = parseFloat(row.original.price / 100);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
    return /* @__PURE__ */ jsx("div", {
      className: "text-right font-medium",
      children: formatted
    });
  }
}];
const user = UNSAFE_withComponentProps(function User() {
  const user2 = useStockStore((state) => state.user);
  const fetchUser = useStockStore((state) => state.fetchUser);
  const pendingTrades = useStockStore((state) => state.pendingTrades);
  const fetchPendingTrades = useStockStore((state) => state.fetchPendingTrades);
  if (!user2) {
    return "Loading";
  }
  const ownedStocks = user2.stocks;
  async function refreshLists() {
    fetchUser();
    fetchPendingTrades();
  }
  useEffect(() => {
    fetchUser();
    fetchPendingTrades();
    setInterval(refreshLists, 5e3);
  }, []);
  useEffect(() => {
    console.log(pendingTrades);
  }, [pendingTrades]);
  return /* @__PURE__ */ jsxs("div", {
    className: "w-50/100 m-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-lg mt-2",
      children: user2.name
    }), /* @__PURE__ */ jsxs("p", {
      children: ["Capital: $", user2.capital / 100]
    }), /* @__PURE__ */ jsx(DataTable, {
      columns: columnDef$1,
      data: ownedStocks ?? []
    }), /* @__PURE__ */ jsx("h2", {
      children: "Pending Orders"
    }), /* @__PURE__ */ jsx(DataTable, {
      columns: pendingColumnDef,
      data: pendingTrades ?? []
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: user
}, Symbol.toStringTag, { value: "Module" }));
const columnDef = [{
  accessorKey: "type",
  header: "Ticker"
}, {
  accessorKey: "side",
  header: "Buy/Sell"
}, {
  accessorKey: "quantity",
  header: "Quantity"
}, {
  accessorKey: "price",
  header: () => /* @__PURE__ */ jsx("div", {
    className: "text-right",
    children: "Price"
  }),
  cell: ({
    row
  }) => {
    const amount = parseFloat(row.getValue("price") / 100);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
    return /* @__PURE__ */ jsx("div", {
      className: "text-right font-medium",
      children: formatted
    });
  }
}, {
  accessorKey: "timestamp",
  header: "Time Traded",
  cell: ({
    row
  }) => {
    const formatted = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(row.getValue("timestamp")));
    return /* @__PURE__ */ jsx("div", {
      className: "text-right font-medium",
      children: formatted
    });
  }
}];
const trades = UNSAFE_withComponentProps(function Trades() {
  const fetchTrades = useStockStore((state) => state.fetchTrades);
  const trades2 = useStockStore((state) => state.trades);
  useEffect(() => {
    fetchTrades();
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    className: "w-50/100 m-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-lg",
      children: "Past Trades"
    }), /* @__PURE__ */ jsx(DataTable, {
      columns: columnDef,
      data: trades2 ?? []
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: trades
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CYPOLie7.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/index-BeddEmVS.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-CLFW6Nwu.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/index-BeddEmVS.js", "/assets/stockStore-4AcyS2rY.js"], "css": ["/assets/root-lchpdB1q.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-PRw3B7Gz.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/DataTable-Cw5ZTj6h.js", "/assets/button-BVkMeSV-.js", "/assets/stockStore-4AcyS2rY.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/order": { "id": "routes/order", "parentId": "root", "path": "/order/:type", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/order-DgcDqvQI.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/stockStore-4AcyS2rY.js", "/assets/button-BVkMeSV-.js", "/assets/utils-BQHNewu7.js", "/assets/index-BeddEmVS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/user": { "id": "routes/user", "parentId": "root", "path": "/user", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/user-ydU-EBf4.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/DataTable-Cw5ZTj6h.js", "/assets/stockStore-4AcyS2rY.js", "/assets/button-BVkMeSV-.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/trades": { "id": "routes/trades", "parentId": "root", "path": "/trades", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/trades-BwTEzUxi.js", "imports": ["/assets/chunk-EPOLDU6W-C4j-r0s0.js", "/assets/DataTable-Cw5ZTj6h.js", "/assets/stockStore-4AcyS2rY.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-5afdf42c.js", "version": "5afdf42c", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/order": {
    id: "routes/order",
    parentId: "root",
    path: "/order/:type",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/user": {
    id: "routes/user",
    parentId: "root",
    path: "/user",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/trades": {
    id: "routes/trades",
    parentId: "root",
    path: "/trades",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
