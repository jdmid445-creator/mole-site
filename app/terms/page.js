export const metadata = {
  title: 'Terms & privacy limits — $TUNNEL',
};

export default function Terms() {
  return (
    <section className="section">
      <div className="container prose">
        <h1 className="page-title">Terms &amp; privacy limits</h1>
        <p className="muted small">Plain-language summary. Not legal advice.</p>

        <h2>What the Tunnel is</h2>
        <p>
          The Tunnel is a website that helps you create cross-chain swaps on NEAR Intents, a third-party network, with its
          confidential setting switched on. Your funds go from your wallet straight to the network's deposit address and
          arrive at the destination you choose. This site never holds, controls or can move your funds, and it never sees
          your private keys.
        </p>

        <h2>What it hides, and what it doesn't</h2>
        <p>
          Confidential mode is designed to hide the public link between the wallet you send from and the wallet you receive
          in, along with amounts and routing inside the network. Your deposit and the arrival are still ordinary public
          transactions on their own chains. Matching amounts and timing can still let someone guess a connection. No tool
          makes you anonymous, and we don't claim this one does.
        </p>

        <h2>Acceptable use</h2>
        <p>Financial privacy is normal. Using the Tunnel to break the law is not allowed. Don't use it to:</p>
        <ul>
          <li>move the proceeds of crime or hide where funds came from;</li>
          <li>evade sanctions, or if you are a sanctioned person or acting for one;</li>
          <li>finance terrorism, fraud, scams or theft;</li>
          <li>do anything prohibited by the laws that apply to you.</li>
        </ul>
        <p>The network screens assets as they enter. You are responsible for your own legal and tax obligations.</p>

        <h2>Risks</h2>
        <ul>
          <li>The swap network, its operators and its infrastructure are run by third parties and can fail, pause or change.</li>
          <li>Prices move. You may receive less than a quote if the market moves before the swap completes.</li>
          <li>Sending to a wrong address, or sending a different amount or asset than shown, can mean lost funds.</li>
          <li>Failed swaps are refunded to the refund address you provide, by the network, not by this site.</li>
        </ul>

        <h2>The $TUNNEL token</h2>
        <p>
          $TUNNEL is a meme coin. It has no promised value, utility, dividends or returns, and you can lose everything you put
          in. The Tunnel is free to use; holding $TUNNEL is not required. Nothing on this site is financial advice.
        </p>

        <h2>Data</h2>
        <p>
          This site doesn't run accounts or store your swaps. Your last chosen pair may be remembered in your own browser
          for convenience. The swap network and your wallet provider have their own policies.
        </p>
      </div>
    </section>
  );
}
