import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  DatePicker,
  Image,
  Modal,
  Select,
  Space,
  Table,
  TableProps,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import Excel from "exceljs";

import { LogData, User } from "@/types";
import UserService from "@/provider/user.service";
import LogService from "@/provider/log.service";

// TODO: validate duplicate employee ID
// page, pageSize, type, userId, fromDate, toDate, project

interface FilterProps {
  tellerId?: string | null;
  fromDate?: Dayjs | null;
  toDate?: Dayjs | null;
}

// !remove
const Attendance = () => {
  const [tellers, setTellers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<FilterProps>({
    tellerId: null,
    fromDate: null,
    toDate: null,
  });
  const [photoViewer, setPhotoViewer] = useState<{
    open: boolean;
    src: string | undefined;
    details?: string;
  }>({ open: false, src: "", details: undefined });
  const [tellerName, setTellerName] = useState("");

  const [total, setTotal] = useState(0);
  const [totalRenderedHourse, setTotalRenderedHours] = useState(0);

  // context and services
  const user = new UserService();
  const log = new LogService();

  const columns: TableProps<LogData>["columns"] = [
    {
      title: "ID",
      dataIndex: "userId",
      render: (_) => _.employeeId,
    },
    {
      title: "User",

      align: "center",
      render: (_, { userId }) => <div>{userId.name.toLocaleUpperCase()} </div>,
    },
    {
      title: "Type",
      dataIndex: "userId",
      render: (_) => _.role.toLocaleUpperCase(),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (_) => dayjs(_).format("MMMM DD, YYYY"),
    },
    {
      title: "Time In",
      align: "center",
      render: ({ userId, timeInPhoto, createdAt, branchId, timeIn }) => (
        <div>
          {dayjs(timeIn).format("hh:mma")}
          {timeInPhoto && (
            <Typography.Link
              style={{
                display: "block",
                textAlign: "center",
              }}
              onClick={() =>
                setPhotoViewer({
                  open: true,
                  src: timeInPhoto,
                  details: ["admin", "encoder"].includes(userId.role)
                    ? ""
                    : `Taken in Branch ${branchId} at ${dayjs(createdAt).format(
                        "MMMM DD, YYYY - hh:mma"
                      )}`,
                })
              }
            >
              view photo
            </Typography.Link>
          )}
        </div>
      ),
    },
    {
      title: "Time Out",
      align: "center",
      render: ({ userId, timeOutPhoto, createdAt, branchId, timeOut }) =>
        timeOut ? (
          <div>
            {dayjs(timeOut).format("hh:mma")}
            {timeOutPhoto && (
              <Typography.Link
                style={{
                  display: "block",
                  textAlign: "center",
                }}
                onClick={() =>
                  setPhotoViewer({
                    open: true,
                    src: timeOutPhoto,
                    details: ["admin", "encoder"].includes(userId.role)
                      ? ""
                      : `Taken in Branch ${branchId} at ${dayjs(
                          createdAt
                        ).format("MMMM DD, YYYY - hh:mma")}`,
                  })
                }
              >
                view photo
              </Typography.Link>
            )}
          </div>
        ) : (
          <Typography.Text type="secondary" italic>
            N/A
          </Typography.Text>
        ),
    },
    {
      title: "Hour(s) Rendered",
      align: "center",
      render: (_, row) =>
        row.timeOut == null ? (
          <Typography.Text type="secondary" italic>
            N/A
          </Typography.Text>
        ) : (
          <span>{calculateHoursRendered(row).toFixed(2)}</span>
        ),
    },
  ];

  const getHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Space size={[32, 0]}>
        <Select
          size="large"
          style={{ width: 250 }}
          placeholder="Select a Teller"
          value={tellerName}
          options={tellers.map((e) => ({
            label: `[${e.role.toLocaleUpperCase()}] ${e.name}`,
            value: e.name,
            key: e._id,
          }))}
          onChange={(_, e: any) => {
            setFilter({ ...filter, tellerId: e?.key ?? null });
            setTellerName(e.label.split("]")[1]);
          }}
          filterOption={(
            input: string,
            option?: { label: string; value: string }
          ) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          allowClear
          showSearch
        />
        <DatePicker.RangePicker
          size="large"
          format="MMMM DD, YYYY"
          onChange={(e) => {
            setFilter({
              ...filter,
              fromDate: e ? e[0] : null,
              toDate: e ? e[1] : null,
            });
          }}
        />
      </Space>
      <Button
        type="primary"
        size="large"
        onClick={() => {
          (async () => {
            await getLogs({
              page: 1,
              pageSize: 99999999,
              userId: filter.tellerId ?? "",
              fromDate: filter.fromDate ?? null,
              toDate: filter.toDate ?? null,
            }).then((e) => {
              if (typeof e == "object" && e.length > 0) exportExcel(e);
            });
          })();
        }}
      >
        EXPORT
      </Button>
    </div>
  );

  const calculateHoursRendered = (__log: LogData): number => {
    if (__log.timeOut == null) return 0;
    let hours = dayjs(__log.timeOut).diff(dayjs(__log.timeIn), "hour");
    let minutes =
      Math.abs(dayjs(__log.timeOut).minute() - dayjs(__log.timeIn).minute()) /
      60;
    return hours + minutes;
  };

  const getLogs = async ({
    page,
    pageSize,
    userId,
    fromDate,
    toDate,
    project,
    updateLogs = true,
  }: {
    page: number;
    pageSize?: number;
    userId?: string | null;
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
    project?: Record<any, any>;
    updateLogs?: boolean;
  }): Promise<LogData[] | any | void> =>
    new Promise(async (resolve, reject) => {
      setFetching(true);
      if (!pageSize) pageSize = 10;

      let res = await log.getLog({
        page,
        pageSize,
        type: "attendance",
        userId,
        fromDate,
        toDate,
        project,
      });

      if (res?.success ?? false) {
        if (!updateLogs) {
          return resolve(res.data);
        }

        setFetching(false);
        setLogs(res?.data ?? []);
        setTotal(res.meta?.total ?? 10);
        setTotalRenderedHours(
          res?.meta?.timers.reduce((p: any, n: any) => {
            if (n.timeOut == null) return p;
            let hours = dayjs(n.timeOut).diff(dayjs(n.timeIn), "hour");
            let minutes =
              Math.abs(dayjs(n.timeOut).minute() - dayjs(n.timeIn).minute()) /
              60;
            return p + hours + minutes;
          }, 0)
        );
        resolve(res.data);
      } else {
        setFetching(false);
        reject();
      }
    });

  const exportExcel = (_logs: LogData[]) => {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");

    // * set the first row to be the title uwu :3
    sheet.mergeCells("A1:G1");
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("A1").font = {
      family: 4,
      size: 18,
      bold: true,
    };
    sheet.getCell("A1").value = "Attendance Report";
    sheet.getRow(2).values = [
      "ID",
      "Employee Name",
      "Role",
      "Date",
      "Time In",
      "Time Out",
      "Hour(s) Rendered",
    ];
    sheet.properties.defaultRowHeight = 20;

    sheet.columns = [
      {
        key: "employeeId",
        width: 15,
      },
      {
        key: "userId",
        width: 30,
      },
      {
        key: "type",
        width: 15,
      },
      {
        key: "date",
        width: 22,
      },
      {
        key: "timeIn",
        width: 15,
      },
      {
        key: "timeOut",
        width: 15,
      },
      {
        key: "renderedHours",
        width: 25,
      },
    ];

    _logs.map((e) => {
      sheet.addRow({
        employeeId: e.userId.employeeId,
        userId: e.userId.name
          .split(" ")
          .map((e) => `${e[0].toLocaleUpperCase()}${e.slice(1)}`)
          .join(" "),
        type: e.userId.role.toLocaleUpperCase(),
        date: dayjs(e?.createdAt).format("MM/DD/YYYY"),
        timeIn: e.timeIn ? dayjs(e.timeIn).format("hh:mma") : "",
        timeOut: e.timeOut ? dayjs(e.timeOut).format("hh:mma") : "",
        renderedHours: calculateHoursRendered(e).toFixed(2),
      });
    });

    let s = (str: string) =>
      sheet.getCell(`${str.toLocaleUpperCase()}${_logs.length + 3}`);
    s("f").font = {
      family: 4,
      size: 12,
    };
    s("f").value = "TOTAL";
    s("g").font = {
      family: 4,
      size: 14,
      bold: true,
    };

    const total = _logs.reduce((p, n) => p + calculateHoursRendered(n), 0);
    s("g").value = total.toFixed(2);

    // * styles the headers and lower cells
    for (let i = 0; i < _logs.length + 1; i++) {
      ["A", "B", "C", "D", "E", "F", "G"].map((c) => {
        sheet.getCell(`${c}${i + 2}`).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        if (i == 0)
          sheet.getCell(`${c}2`).font = {
            family: 4,
            size: 12,
            bold: true,
          };
      });
    }

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ATTENDANCE-REPORT-${dayjs().format("MM/DD/YYYY")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      message.success("Exported to Excel successfully");
    });
  };

  useEffect(() => {
    // get tellers
    (async (_) => {
      let res = await _.getUsers({
        page: 1,
        pageSize: 9999,
        notRole: ["admin"],
      });

      if (res?.success ?? false) setTellers((res?.data as User[]) ?? []);
    })(user);

    getLogs({
      page: 1,
      userId: filter.tellerId ?? null,
      fromDate: filter.fromDate ?? null,
      toDate: filter.toDate ?? null,
    });
  }, [filter]);

  return (
    <>
      <div
        style={{
          padding: 10,
        }}
      >
        <Table
          title={getHeader}
          columns={columns}
          loading={fetching}
          dataSource={logs}
          rowKey={(e) => e._id ?? ""}
          scroll={{
            y: "calc(100vh - 30em)",
            x: "100%",
          }}
          pagination={{
            defaultPageSize: 10,
            total,
            onChange: (page, pageSize) =>
              getLogs({
                page,
                pageSize,
                userId: filter.tellerId ?? null,
                fromDate: filter.fromDate ?? null,
                toDate: filter.toDate ?? null,
              }),
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} />
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
                <Table.Summary.Cell index={6}>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <Typography.Text style={{ flex: 5 }} strong>
                      Total:
                    </Typography.Text>
                    <span style={{ flex: 7 }}>
                      {totalRenderedHourse.toFixed(2)}
                    </span>
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
          sticky
          bordered
        />
      </div>

      {/* context */}
      <Modal
        open={photoViewer.open}
        width={650}
        onCancel={() =>
          setPhotoViewer({
            open: false,
            src: undefined,
            details: "",
          })
        }
        footer={null}
        closable={false}
      >
        <Image
          src={photoViewer.src ?? ""}
          alt="just-an-image"
          style={{
            borderRadius: 10,
          }}
        />

        {/* <Typography.Text style={{ paddingTop: 25, fontSize: "1.25em" }}>
          {photoViewer.details ?? ""}
        </Typography.Text> */}
      </Modal>
    </>
  );
};

export default Attendance;
