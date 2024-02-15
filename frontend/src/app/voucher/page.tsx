"use client";
import { FC, useEffect, useState } from "react";
import { Badge, Button, Card, Center, Divider, Flex, Group, Stack, Text } from "@mantine/core";
import { GetVouchers } from "../../model/reader";
import { Voucher } from "../../model/state";
import { decodePayload, getVouchersByUser } from "../../utils/voucher";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { getDAppAddress } from "../../utils/address";
import { getExecuteVoucherABI, getWasVoucherExecutedABI } from "../../utils/voucher";

const WithdrawButton : FC<{voucher:Voucher}> = ({voucher}) => {
  const [isExecuted, setIsExecuted] = useState(false);
  const [isWaitingProof, setIsWaitingProof] = useState(true);

  const { data, isError, isLoading } = useContractRead({
    address: getDAppAddress(),
    abi: getWasVoucherExecutedABI(),
    functionName: 'wasVoucherExecuted',
    args: [
        voucher.input.index,
        voucher.index
    ],
  });

  const { write } = useContractWrite({
    address: getDAppAddress(),
    abi: getExecuteVoucherABI(),
    functionName: 'executeVoucher',
    args: [ voucher.destination,voucher.payload,voucher.proof],
  });

  useEffect(() => {
    if (!!voucher.proof) {
      setIsWaitingProof(false);

      if (!isLoading && data==true) {
        setIsExecuted(true);
      } else {
        setIsExecuted(false);
      } 
    } else {
      setIsWaitingProof(true);
      setIsExecuted(false);
    }
  }, [data, isLoading]);

  if (isWaitingProof) {
    return <Badge color="orange">Waiting proof...</Badge>
  } else {
    if (isExecuted) {
      return <Badge color="green">Executed!</Badge>
    } else {
      return <Button color="blue" onClick={() => write && write()}>Withdraw</Button>;
    }
  } 
}

const VoucherInfo: FC<{voucher:Voucher}> = ({voucher}) => {
    const {voucherDestination, voucherAmount} = decodePayload(voucher.payload) || { voucherDestination: null, voucherAmount: null };
 
    return(
        <Center>
            <Card w="400px" shadow="sm" radius="md" withBorder>
              <Flex justify="space-between">
                <Text size="lg"> {voucherAmount} ETH</Text>
                <WithdrawButton voucher={voucher}/>
              </Flex>
              <Divider/>
              <Group pt="20px">
                <Text size="xs">Voucher:{voucher.index}</Text>
                <Text size="xs">/</Text>
                <Text size="xs">Input:{voucher.input.index}</Text>
              </Group>
            </Card>
        </Center>
    );
}

const VoucherList: FC<{allVouchers:Voucher[], connectedAccount:string}> = ({allVouchers,connectedAccount}) => {
  const accountVouchers = getVouchersByUser(allVouchers, connectedAccount);
  return(
    <Stack>
      <Center mt="xl">
        {accountVouchers.length > 0 ? <Text size="xl">Available vouchers:</Text> : <Text size="xl">No vouchers available!</Text>}
      </Center>
      { 
        accountVouchers.length > 0 && 
        accountVouchers.map( (voucher) => {
          const key=voucher.index + voucher.input.index;
          return (
            <VoucherInfo key={key} voucher={voucher} />
          )
        })
      }
      </Stack>
  );           
}

const VoucherHome: FC = () => {
  const { address } = useAccount();
  const result = GetVouchers();
  switch (result.kind) {
    case "loading":
      return <Center h="200px">Checking for vouchers...</Center>;
    case "error":
      return <Center h="200px">{result.message}</Center>;
    case "success":
      const allVouchers = result.response;
      {
        if (allVouchers.length > 0) {
          return (
            <VoucherList allVouchers={allVouchers} connectedAccount={address || ''} />
          );
        } else {
          return <Center h="200px">No vouchers available!</Center>;
        }
      }
  }
}

export default VoucherHome;