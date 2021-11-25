import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Identicon from '../../ui/identicon';
import LedgerInstructionField from '../ledger-instruction-field';
import Header from './signature-request-header';
import Footer from './signature-request-footer';
import Message from './signature-request-message';
import { TypedDataUtils } from 'eth-sig-util';
import { MESSAGE_TYPE } from '../../../../shared/constants/app';

export default class SignatureRequest extends PureComponent {
  static propTypes = {
    txData: PropTypes.object.isRequired,
    fromAccount: PropTypes.shape({
      address: PropTypes.string.isRequired,
      balance: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    isLedgerWallet: PropTypes.bool,
    cancel: PropTypes.func.isRequired,
    sign: PropTypes.func.isRequired,
    hardwareWalletRequiresConnection: PropTypes.func.isRequired,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  formatWallet(wallet) {
    return `${wallet.slice(0, 8)}...${wallet.slice(
      wallet.length - 8,
      wallet.length,
    )}`;
  }

  render() {
    const {
      fromAccount,
      txData: {
        msgParams: { data, origin, version },
        type,
      },
      cancel,
      sign,
      isLedgerWallet,
      hardwareWalletRequiresConnection,
    } = this.props;
    const { address: fromAddress } = fromAccount;
    const { message, domain = {}, types, primaryType } = JSON.parse(data);
    const { metricsEvent } = this.context;

    const mapType = (msgType, definedType) => {
      // try and map it to a solidity type
      if (
        (
          definedType.type.indexOf("int") >= 0 ||
          definedType.type.indexOf("fixed") >= 0
        ) && msgType === "number") {
        return true;
      } else if (
        (
          definedType.type.indexOf("bytes") >= 0 ||
          definedType.type === "address"
        ) && msgType === "string") {
        return true;
      }

      return false;
    }

    const sanitizeMessage = () => {
      let sanitizedMessage = TypedDataUtils.sanitizeData(JSON.parse(data));
      const msgKeys = Object.keys(message);      
      const msgTypes = Object.values(message).map(value => typeof (value));            
      const primaryTypeType = types[primaryType];
      msgKeys.forEach((msgKey, index) => {
        const definedType = Object.values(primaryTypeType).find(ptt => ptt.name === msgKey);        
        const valueType = msgTypes[index];
        alert(definedType.type);
        alert(valueType);

        if (definedType) {
          if (definedType === valueType) {
            sanitizedMessage[msgKey] = message[msgKey];
          } else if (definedType.indexOf("[]") && valueType === "array") {
            sanitizedMessage[msgKey] = message[msgKey];
          } else if (mapType(valueType, definedType)) {
            sanitizedMessage[msgKey] = message[msgKey];
          }
        }

        alert(definedType.type);
        // if we get here we can't find or map the type....what should we do ??        
      });

      return sanitizedMessage;
    }

    const onSign = (event) => {
      sign(event);
      metricsEvent({
        eventOpts: {
          category: 'Transactions',
          action: 'Sign Request',
          name: 'Confirm',
        },
        customVariables: {
          type,
          version,
        },
      });
    };

    const onCancel = (event) => {
      cancel(event);
      metricsEvent({
        eventOpts: {
          category: 'Transactions',
          action: 'Sign Request',
          name: 'Cancel',
        },
        customVariables: {
          type,
          version,
        },
      });
    };

    return (
      <div className="signature-request page-container" >
        <Header fromAccount={fromAccount} />
        <div className="signature-request-content">
          <div className="signature-request-content__title">
            {this.context.t('sigRequest')}
          </div>
          <div className="signature-request-content__identicon-container">
            <div className="signature-request-content__identicon-initial">
              {domain.name && domain.name[0]}
            </div>
            <div className="signature-request-content__identicon-border" />
            <Identicon address={fromAddress} diameter={70} />
          </div>
          <div className="signature-request-content__info--bolded">
            {domain.name}
          </div>
          <div className="signature-request-content__info">{origin}</div>
          <div className="signature-request-content__info">
            {this.formatWallet(fromAddress)}
          </div>
        </div>
        {isLedgerWallet ? (
          <div className="confirm-approve-content__ledger-instruction-wrapper">
            <LedgerInstructionField showDataInstruction />
          </div>
        ) : null}
        <Message data={sanitizeMessage()} />
        <Footer
          cancelAction={onCancel}
          signAction={onSign}
          disabled={hardwareWalletRequiresConnection}
        />
      </div >
    );
  }
}
