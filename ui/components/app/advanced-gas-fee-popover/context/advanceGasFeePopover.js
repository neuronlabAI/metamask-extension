import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const AdvanceGasFeePopoverContext = createContext({});

export const AdvanceGasFeePopoverContextProvider = ({ children }) => {
  const [maxFeePerGas, setMaxFeePerGas] = useState();
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState();
  const [isDirty, setDirty] = useState();
  const [maxBaseFee, setMaxBaseFee] = useState();

  return (
    <AdvanceGasFeePopoverContext.Provider
      value={{
        isDirty,
        maxFeePerGas,
        maxPriorityFeePerGas,
        maxBaseFee,
        setDirty,
        setMaxPriorityFeePerGas,
        setMaxFeePerGas,
        setMaxBaseFee,
      }}
    >
      {children}
    </AdvanceGasFeePopoverContext.Provider>
  );
};

export function useAdvanceGasFeePopoverContext() {
  return useContext(AdvanceGasFeePopoverContext);
}

AdvanceGasFeePopoverContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
