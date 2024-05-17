import React, { useEffect, useState } from "react";
import {
  Button,
  GetProp,
  Table,
  TableColumnsType,
  TableProps,
  Tag,
  Transfer,
  TransferProps,
  Typography,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { BillingSettingsType, BillingsFormField, Wallet } from "@/types";
import BillService from "@/provider/bill.service";
import WalletService from "@/provider/wallet.service";

type TransferItem = GetProp<TransferProps, "dataSource">[number];
type TableRowSelection<T extends object> = TableProps<T>["rowSelection"];

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: BillingsFormField[];
  leftColumns: TableColumnsType<BillingsFormField>;
  rightColumns: TableColumnsType<BillingsFormField>;
}

const TableTransfer = ({
  leftColumns,
  rightColumns,
  ...restProps
}: TableTransferProps) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelect,
      onItemSelectAll,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === "left" ? leftColumns : rightColumns;

      const rowSelection: TableRowSelection<TransferItem> = {
        getCheckboxProps: () => ({ disabled: listDisabled }),
        onChange(selectedRowKeys) {
          onItemSelectAll(selectedRowKeys, "replace");
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          style={{ pointerEvents: listDisabled ? "none" : undefined }}
          rowSelection={rowSelection}
          dataSource={filteredItems}
          pagination={false}
          columns={columns}
          size="large"
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) {
                return;
              }
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const columns: TableColumnsType<BillingsFormField> = [
  {
    dataIndex: "name",
    title: "Name",
    render: (_) => (
      <Typography.Text
        style={{
          fontSize: "1.35em",
        }}
      >
        {_}
      </Typography.Text>
    ),
  },
  {
    dataIndex: "type",
    title: "Form Type",
    render: (type) => (
      <Tag
        style={{
          marginInlineEnd: 0,
          color: "#2F54EB",
          fontSize: "1.35em",
          padding: 5,
        }}
        color="#F0F5FF"
      >
        {type.toUpperCase()}
      </Tag>
    ),
  },
];

const PrinterException = ({
  biller,
  wallet,
  walletKey,
  refresh,
}: {
  biller?: BillingSettingsType | null;
  wallet?: Wallet | null;
  walletKey?: string;
  refresh: () => void;
}) => {
  //updateExceptionBiller
  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>([]);

  const bill = new BillService();
  const walletService = new WalletService();

  let dataSource = biller
    ? biller?.formField?.map((e, i) => ({
        ...e,
        key: e.slug_name,
      })) ?? []
    : (
        (walletKey == "cash-in"
          ? wallet?.cashInFormField
          : wallet?.cashOutFormField) ?? []
      ).map((e, i) => ({
        ...e,
        key: e.slug_name,
      })) ?? [];

  const onChange: TableTransferProps["onChange"] = (nextTargetKeys, dir, e) => {
    setTargetKeys(nextTargetKeys);

    let convertedKeys = e.map((e) => ({
      name: e.toString(),
      type: dataSource.filter((_) => _.key?.toString() == e)[0].type,
    }));

    if (biller)
      (async (_) => {
        let res = await _.updateExceptionBiller(
          biller?._id ?? "",
          dir,
          convertedKeys
        );

        if (res?.success ?? false) {
          message.success(res?.message ?? "Updated");
          refresh();
        }
      })(bill);
    else
      (async (_) => {
        let res = await _.updateExceptionWallet(
          wallet?._id ?? "",
          dir,
          walletKey!,
          convertedKeys
        );

        if (res?.success ?? false) {
          message.success(res?.message ?? "Updated");
          refresh();
        }
      })(walletService);
  };

  // set except form field to active target keys
  useEffect(() => {
    let keys: any;

    if (biller)
      keys =
        biller?.formField
          ?.filter((e) =>
            biller.exceptFormField?.map((_) => _.name).includes(e.slug_name!)
          )
          ?.map((e) => e.slug_name) ?? [];
    else
      keys =
        (
          (walletKey == "cash-in"
            ? wallet?.cashInFormField
            : wallet?.cashOutFormField) ?? []
        )
          ?.filter((e) =>
            (
              (walletKey == "cash-in"
                ? wallet?.cashInexceptFormField
                : wallet?.cashOutexceptFormField) ?? []
            )
              .map((_) => _.name)
              .includes(e.slug_name!)
          )
          ?.map((e) => e.slug_name) ?? [];

    setTargetKeys(keys as React.Key[]);
  }, [biller]);

  return (
    <>
      <TableTransfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        showSelectAll={false}
        onChange={onChange}
        filterOption={
          (inputValue, item) =>
            item
              .name!.toLocaleLowerCase()
              .indexOf(inputValue.toLocaleLowerCase()) !== -1
          //   ||
          // item.type
          //   .toLocaleLowerCase()
          //   .indexOf(inputValue.toLocaleLowerCase()) !== -1
        }
        listStyle={{
          cursor: "pointer",
        }}
        leftColumns={columns}
        rightColumns={columns}
        rowKey={(e) => e.key}
        titles={[
          <div key="header-1">
            {biller
              ? "Forms"
              : walletKey == "cash-in"
              ? "Form Cash-In"
              : "Form Cash-Out"}
          </div>,
          <div key="header-2">Exception Forms</div>,
        ]}
        footer={(_, e) =>
          e?.direction == "left" ? (
            <Button
              size="large"
              style={{ margin: 5 }}
              icon={<ReloadOutlined />}
              onClick={() => {
                // todo: if clicked, update also the api to initial
                setTargetKeys([]);
              }}
            >
              RESET
            </Button>
          ) : (
            <></>
          )
        }
        showSearch
      />
    </>
  );
};

export default PrinterException;
