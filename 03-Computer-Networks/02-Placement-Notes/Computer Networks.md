# Computer Networks

## Source & Scope

These notes are reorganized from the **complete supplied Computer Networks content** for placement preparation. The source includes material from Kurose & Ross E6, GeeksforGeeks, and [hpbn.co](http://hpbn.co), as identified in the original notes.

## Contents

1. Layers & reference models
2. Application Layer
3. Transport Layer
4. Network Layer
5. Data Link Layer
6. Physical Layer
7. Browser / `google.com` question
8. Ports & protocol recap
9. Original study references, TODOs and image references

## Layer Order

### OSI Model

- Physical layer
- Data layer
- Network layer
- Transport layer
- Session layer
    - Dialog control — whose turn is to transmit
    - Token management — preventing two parties from attempting the same crucial operation simultaneously
    - Synchronization — checkpointing long transmission to pick up from where they left off in the event of a crash and subsequent recovery
- Presentation layer — concerned with syntax and semantics of the information transmitted
- Application layer

### TCP/IP Reference Model

- Link layer = Data Link layer
- Internet layer = Network layer of OSI
- Transport layer
- Application layer = Session + Presentation + Application layer of OSI

### Kurose & Ross E6 — Top-Down Approach

- Application layer
- Transport layer
- Network layer
- Data link layer
- Physical layer

---

# Application Layer

## Transport Services Available to Applications

- Reliable Data Transfer
- Throughput
- Timing
- Security

## TCP Services

- **Connection-oriented services:** TCP has the client and server exchange transport-layer control information before application-level messages begin to flow. This handshaking lets both sides prepare for packets. After handshaking, a TCP connection exists between the sockets of the two processes. It is full-duplex, so both processes can send messages at the same time. When the application finishes sending messages, it must tear down the connection.
- **Reliable data transfer:** communicating processes can rely on TCP to deliver all data sent without error and in proper order. A stream of bytes passed into a socket is delivered as the same stream, with no missing or duplicate bytes.
- TCP also includes a **congestion-control mechanism**.

## UDP Services

- UDP is a no-frills, lightweight transport protocol providing minimal services.
- UDP is connectionless, so there is no handshaking before communication.
- UDP provides an unreliable data transfer service.
- There is no guarantee that a message sent into a UDP socket reaches the receiving process.
- Messages that arrive may arrive out of order.
- UDP does not include a congestion-control mechanism.
- The sending side can pump data into the network layer at any rate it pleases.
- Actual end-to-end throughput may still be lower because of limited transmission capacity or congestion.

## HTTP

**HTTP:** an application-level protocol that uses TCP as an underlying transport and typically runs on port 80. HTTP is stateless: the server maintains no information about past client requests.

The server sends requested files without storing state information about the client. If a client asks for the same object twice, the server resends it because it has forgotten the earlier request. The Web uses the client-server application architecture. A Web server is always on, with a fixed IP address, and services requests from potentially millions of browsers.

### HTTP Request Message

```
GET /somedir/page.html HTTP/1.1
Host: www.someschool.edu
Connection: close
User-agent: Mozilla/5.0
Accept-language: fr
```

**Original image reference:** `images/image4.png` — Source: Page-105, Kurose & Ross E6.

### HTTP Response Message

```
HTTP/1.1 200 OK
Connection: close
Date: Tue, 09 Aug 2011 15:44:04 GMT
Server: Apache/2.2.3 (CentOS)
Last-Modified: Tue, 09 Aug 2011 15:11:03 GMT
Content-Length: 6821
Content-Type: text/html
(data data data data data ...)
```

**Original image reference:** `images/image9.png`

### Common HTTP Status Codes

- **200 OK:** Request succeeded and information is returned in the response.
- **301 Moved Permanently:** Requested object has been permanently moved; the new URL is specified in the `Location:` header. Client software automatically retrieves the new URL.
- **400 Bad Request:** Generic error code indicating that the request could not be understood by the server.
- **404 Not Found:** Requested document does not exist on the server.
- **505 HTTP Version Not Supported:** Requested HTTP protocol version is not supported by the server.

## FTP

**FTP:** application-layer protocol that moves files between local and remote file systems. It runs on top of TCP. Two TCP connections are used in parallel:

- control connection
- data connection

The control connection sends control information such as user identification, password, commands to change the remote directory, and `put`/`get` commands. The data connection actually sends a file.

Because FTP uses a separate control connection, FTP sends control information **out-of-band**. HTTP sends request/response headers into the same TCP connection that carries the transferred file, so HTTP sends control information **in-band**. SMTP also sends control information **in-band**.

When an FTP session starts, the client first initiates a control TCP connection with the server on **port 21**. User identification, password, and remote-directory commands travel over the control connection. For a file transfer, the server initiates a TCP data connection to the client. FTP sends exactly one file over the data connection and closes it. Another file requires another data connection. The control connection remains open throughout the session, while each data connection is non-persistent.

FTP server maintains state about the user, including the user account associated with the control connection and the current directory. HTTP is stateless and does not keep such user state.

### FTP Commands

- `USER username` — send user identification.
- `PASS password` — send user password.
- `LIST` — ask the server for a list of files in the current remote directory; the list is sent over a new data connection.
- `RETR filename` — retrieve a file from the current remote directory; server initiates the data connection and sends the requested file.
- `STOR filename` — store a file in the current remote directory.

### FTP Replies

```
331 Username OK, password required
125 Data connection already open; transfer starting
425 Can't open data connection
452 Error writing file
```

**Original image references:** `images/image13.png`, `images/image27.png`

## SMTP

**SMTP:** application-layer protocol. The client that wants to send mail opens a TCP connection to the SMTP server and sends the mail across it. The SMTP server is always listening. The notes give **port 25**.

### Alice → Bob Flow

1. Alice's user agent gets Bob's email address, composes a message, and instructs the user agent to send it.
2. Alice's user agent sends the message to her mail server, where it is placed in a message queue.
3. SMTP on Alice's mail server sees the queued message and opens a TCP connection to Bob's SMTP server.
4. After initial SMTP handshaking, the SMTP client sends Alice's message into the TCP connection.
5. Bob's SMTP server receives it and places it in Bob's mailbox.
6. Bob's user agent reads the message later.

SMTP does not generally use intermediate mail servers and uses a persistent connection.

### HTTP vs SMTP

- HTTP is mainly a **pull protocol** — the machine wanting to receive the file initiates the TCP connection.
- SMTP is primarily a **push protocol** — the sending mail server initiates the TCP connection.
- SMTP requires each message, including its body, to be in 7-bit ASCII format. Non-7-bit ASCII characters or binary data must be encoded into 7-bit ASCII.
- HTTP data does not impose this restriction.
- HTTP encapsulates each object in its own HTTP response message.
- Internet mail places all of a message's objects into one message.

**Original image references:** `images/image17.png`, `images/image6.png`

## Mail Access Protocols

### POP3

POP3 is an extremely simple mail access protocol defined in RFC 1939. The user agent opens a TCP connection to the mail server on **port 110**.

Three phases:

1. **Authorization:** username and password are sent in the clear to authenticate.
2. **Transaction:** retrieve messages, mark messages for deletion, remove deletion marks, and obtain mail statistics.
3. **Update:** after the client issues `quit`, the server deletes messages marked for deletion.

POP3 replies:

- `+OK` — previous command was fine.
- `-ERR` — something was wrong with the previous command.

### IMAP

An IMAP server associates each message with a folder. New messages arrive in the recipient's INBOX. Users can move messages, read them, delete them, create folders, and search remote folders for matching messages.

Unlike POP3, an IMAP server maintains user state across sessions, such as folder names and message-folder associations.

IMAP can retrieve components of messages, such as only the header or one part of a multipart MIME message. This is useful on low-bandwidth connections because the user may avoid downloading an entire mailbox or long media-containing messages.

### Web-based E-mail

The user agent is an ordinary Web browser and communicates with the remote mailbox via HTTP. Reading mail uses HTTP between the mail server and browser. Sending mail uses HTTP between browser and mail server. The mail server still uses SMTP to communicate with other mail servers.

**Original image reference:** `images/image20.png`

## DNS

**DNS:** host-name-to-IP-address translation service. It is a distributed database implemented in a hierarchy of name servers and is an application-layer protocol for message exchange between clients and servers.

### DNS Services

- Translating host names to IP addresses.
- **Host aliasing:** a complicated hostname can have one or more alias names. The complicated hostname is the canonical hostname.
- **Mail server aliasing:** DNS can obtain the canonical hostname and IP address of a mail server for a supplied alias hostname. The MX record permits a company's mail server and Web server to have identical aliased hostnames.
- **Load distribution:** DNS can distribute traffic among replicated servers by associating a canonical hostname with a set of IP addresses and rotating their ordering in replies. Because clients typically send an HTTP request to the first address listed, DNS rotation distributes traffic among replicated servers.

DNS rotation is also used for email. The notes mention that content distribution companies such as Akamai have used DNS in more sophisticated ways for Web content distribution.

### How DNS Works

An application such as a Web browser or mail reader invokes DNS with the hostname needing translation. On many UNIX-based machines, `gethostbyname()` is the function call used by an application. DNS sends a query into the network. **The supplied notes state that all DNS query and reply messages are sent within UDP datagrams to port 53.** After a delay ranging from milliseconds to seconds, the DNS reply provides the desired mapping, which is passed to the invoking application. The DNS service is implemented by many distributed DNS servers plus an application-layer protocol defining communication.

## Peer-to-Peer Applications

### P2P File Distribution

**Original image references:** `images/image22.png`, `images/image14.png`, `images/image11.png`

### BitTorrent — Rarest First

Alice determines which chunks she does not have and requests the chunks that are rarest among her neighbors first. This helps rare chunks get redistributed and aims to roughly equalize the number of copies of each chunk in the torrent.

### BitTorrent — Trading / Unchoking

Alice continually measures the rate at which she receives bits from each neighbor and determines the four peers feeding her at the highest rate. She reciprocates by sending chunks to those same four peers. Every **10 seconds**, she recalculates the rates and may modify the four peers.

Every **30 seconds**, Alice randomly selects one additional neighbor and sends it chunks. This peer is **optimistically unchoked**. If that peer becomes one of Alice's top four uploaders, it can become a continuing trading partner.

All other neighboring peers besides the four top peers and the one probing peer are **choked** and do not receive chunks from Alice. This trading mechanism is referred to as **tit-for-tat**.

The notes also mention pieces/mini-chunks, pipelining, random first selection, endgame mode, and anti-snubbing as BitTorrent mechanisms not discussed in detail.

### Distributed Hash-Tables (DHT)

**Original image reference:** `images/image16.png`

## Socket Programming

**Socket Programming [KuroseRoss]** is listed in the original notes as a topic.

## Protocol Recap

### DHCP

DHCP is an application-layer protocol used to provide:

- Subnet Mask — Option 1 — e.g. `255.255.255.0`
- Router Address — Option 3 — e.g. `192.168.1.1`
- DNS Address — Option 6 — e.g. `8.8.8.8`
- Vendor Class Identifier — Option 43 — e.g. `'unifi' = 192.168.1.9` where unifi = controller

### SNMP

SNMP is an application-layer protocol using **UDP port 161/162**. It is used to monitor networks, detect network faults, and sometimes configure remote devices.

### HTTPS

The supplied notes state:

**HTTPS = HTTP + cryptographic protocols** such as SSL and/or TLS.

To achieve security in HTTPS, the notes describe Public Key Infrastructure (PKI), public keys usable by several Web browsers, private keys used by the Web server of a particular website, and certificates used to distribute public keys. The notes state that certificates can be checked in browser settings. **Port: 443.**

## UDP Protocols

### UDP Header

Original image reference: `images/image19.png`

1. **Source Port:** 2-byte field identifying the source port number.
2. **Destination Port:** 2-byte field identifying the destination port.
3. **Length:** 16-bit field specifying the length of UDP including header and data.
4. **Checksum:** 2-byte field. It is the 16-bit one's complement of the one's complement sum of the UDP header, pseudo-header information from the IP header, and data, padded with zero octets at the end if necessary to make a multiple of two octets.

Unlike TCP, checksum calculation is not mandatory in UDP. No error control or flow control is provided by UDP. UDP therefore depends on IP and ICMP for error reporting.

### Protocols Listed as Using UDP

- NTP — Network Time Protocol
- DNS — Domain Name Service
- BOOTP
- DHCP
- NNP — Network News Protocol
- Quote of the Day protocol
- TFTP
- RTSP
- RIP
- OSPF

### When to Use UDP?

- Reduce computer-resource requirements.
- Multicast or broadcast transfer.
- Transmission of real-time packets, mainly in multimedia applications.

### NTP

**Network Time Protocol (NTP):** used to synchronize the time of a computer client or server to another server or reference time source.

Also listed in the original notes:

- RARP
- BOOTP
- DHCP

**Reference:** Read protocols from Tanenbaum P465.

---

# Transport Layer

*Source: P185–285, Kurose & Ross E6*

The transport layer has the critical role of providing communication services directly to application processes running on different hosts.

## Transport Layer Services

A transport-layer protocol provides **logical communication** between application processes running on different hosts. From an application's perspective, it is as if the hosts running the processes were directly connected; in reality, they may be on opposite sides of the planet, connected via numerous routers and a wide range of link types.

Application processes use this logical communication to send messages without worrying about the physical infrastructure carrying those messages.

- The transport layer is **not implemented in intermediate network routers**.
- It is implemented in the **end systems**.

**Original image reference:** `images/image25.png`

## Relationship Between Transport and Network Layers

- application messages = letters in envelopes
- processes = cousins
- hosts / end systems = houses
- transport-layer protocol = Ann and Bill
- network-layer protocol = postal service, including mail carriers

## TCP vs UDP Overview

- **UDP:** unreliable, connectionless service to the invoking application.
- **TCP:** reliable, connection-oriented service to the invoking application.

In Internet context, a transport-layer packet is called a **segment** in these notes. Internet literature often calls a UDP transport-layer packet a datagram, but also uses datagram for the network-layer packet. To avoid confusion, these notes use segment for both TCP and UDP and reserve datagram for the network-layer packet.

## Multiplexing and Demultiplexing

**Demultiplexing:** delivering data in a transport-layer segment to the correct socket.

**Multiplexing:** gathering data chunks at the source host from different sockets, encapsulating each data chunk with header information that will later be used in demultiplexing, creating segments, and passing them to the network layer.

Transport-layer multiplexing requires:

1. Sockets have unique identifiers.
2. Each segment has special fields indicating the socket to which it should be delivered.

These fields are the source port and destination port. Each port number is **16 bits**, ranging from **0 to 65535**. Ports **0–1023** are well-known port numbers and are reserved for well-known application protocols such as HTTP (80) and FTP (21).

### Question from the Original Notes

**What happens if there are two FTP processes running?**

The original notes preserve external references for this question:

- [https://stackoverflow.com/questions/3329641/how-do-multiple-clients-connect-simultaneously-to-one-port-say-80-on-a-server](https://stackoverflow.com/questions/3329641/how-do-multiple-clients-connect-simultaneously-to-one-port-say-80-on-a-server)
- [https://superuser.com/questions/1267192/multiple-processes-listening-on-the-same-port-how-is-it-possible](https://superuser.com/questions/1267192/multiple-processes-listening-on-the-same-port-how-is-it-possible)
- [https://stackoverflow.com/questions/1694144/can-two-applications-listen-to-the-same-port](https://stackoverflow.com/questions/1694144/can-two-applications-listen-to-the-same-port)

**Original image reference:** `images/image21.png`

### TCP Socket vs UDP Socket

- TCP socket is identified by a four-tuple: `(source IP address, source port number, destination IP address, destination port number)`.
- UDP socket is identified by a two-tuple: `(destination IP address, destination port number)`.

## UDP

There is no handshaking between sending and receiving transport-layer entities before a UDP segment is sent. Therefore UDP is **connectionless**.

**The notes explicitly state: DNS uses UDP.**

**Original image references:** `images/image29.png`, `images/image23.png`

The UDP length field specifies the number of bytes in the UDP segment, including header plus data.

## UDP Checksum

UDP at the sender performs the 1s complement of the sum of all 16-bit words in the segment, with overflow wrapped around.

Example three 16-bit words:

```
0110011001100000
0101010101010101
1000111100001100
```

Sum of the first two:

```
0110011001100000
0101010101010101
Result: 1011101110110101
```

Add the third:

```
1011101110110101
1000111100001100
Result: 0100101011000010
```

The last addition had overflow, which is wrapped around. The 1s complement of `0100101011000010` is `1011010100111101`, which becomes the checksum.

At the receiver, all four 16-bit words, including the checksum, are added. If no errors are introduced, the receiver's sum is:

```
1111111111111111
```

If one of the bits is 0, the notes state that errors have been introduced.

**Original note:** “What is meant by all 16-bit word segments? => UDP header contents.”

## Principles of Reliable Data Transfer

**Study from Kurose & Ross E6: P204–230.**

**Original image references:** `images/image18.png`, `images/image3.png`, `images/image30.png`, `images/image7.png`

## TCP Connection

- TCP provides a **full-duplex service**.
- A TCP connection is always **point-to-point**, between a single sender and a single receiver.
- Multicasting from one sender to many receivers in a single send operation is not possible with TCP.

### TCP Send and Receive Buffers

Once a TCP connection is established, the two application processes can send data to each other.

The client process passes a stream of data through the socket. TCP directs this data to the connection's **send buffer**. TCP periodically grabs chunks from the send buffer and passes them to the network layer.

The maximum amount of data that can be grabbed and placed in a segment is limited by the **Maximum Segment Size (MSS)**.

MSS is typically set by determining the largest link-layer frame that the local sending host can send, called the **Maximum Transmission Unit (MTU)**, and setting MSS so that a TCP segment plus TCP/IP headers (typically 40 bytes) fits into a single link-layer frame.

The supplied notes state that both Ethernet and PPP link-layer protocols have an MSS of **1,500 bytes**. Path-MTU discovery is also mentioned as a way to discover the largest link-layer frame that can be sent on all links from source to destination and set MSS based on path MTU.

**Important:** MSS is the maximum amount of application-layer data in the segment, not the maximum size of the TCP segment including headers.

TCP pairs each data chunk with a TCP header, forming TCP segments. These are passed to the network layer and separately encapsulated within IP datagrams. At the receiver, TCP places segment data in the TCP connection's **receive buffer**, from which the application reads the stream. Each side has its own send buffer and receive buffer.

A TCP connection consists of buffers, variables, and a socket connection to a process in one host, and another set in the other host. No buffers or variables are allocated to the connection in intermediate routers, switches, or repeaters.

## TCP Segment Structure

**Original image reference:** `images/image8.png`

- Source and destination port numbers — multiplexing/demultiplexing.
- 32-bit sequence number field — reliable data transfer.
- 32-bit acknowledgment number field — reliable data transfer.
- 16-bit receive window — flow control.
- 4-bit header length — specifies TCP header length in 32-bit words.
- TCP header can be variable length because of the options field.
- Typical TCP header is 20 bytes when options are empty.
- Options field is optional and variable-length; used for MSS negotiation, window scaling, and timestamping.
- Flag field contains 6 bits in the supplied notes.

### TCP Flags

- **ACK:** acknowledgment field value is valid; segment contains an acknowledgment for a successfully received segment.
- **RST, SYN, FIN:** used for connection setup and teardown.
- **PSH:** receiver should pass data to upper layer immediately.
- **URG:** segment contains data marked urgent by the upper layer; urgent-data pointer indicates the location of the last byte of urgent data.

The notes state that PSH, URG, and the urgent data pointer are not used in practice.

## Sequence Numbers and Acknowledgment Numbers

### Sequence Numbers

TCP views data as an unstructured but ordered stream of bytes.

The sequence number for a segment is the byte-stream number of the **first byte in the segment**.

Example from the notes:

- File size = 500,000 bytes
- MSS = 1,000 bytes
- First byte number = 0
- TCP constructs 500 segments

Sequence numbers:

- first segment → 0
- second segment → 1,000
- third segment → 2,000
- and so on.

Each sequence number is inserted into the sequence-number field of the appropriate TCP segment.

**Original image reference:** `images/image1.png`

### Acknowledgment Numbers

TCP is full-duplex. Host A may receive data from Host B while sending data to B over the same connection.

The acknowledgment number that Host A puts in its segment is the sequence number of the **next byte Host A is expecting from Host B**.

Example:

If Host A has received bytes 0 through 535 from B, A is waiting for byte 536, so A puts **536** in the acknowledgment number field.

If A receives bytes 0–535 and then bytes 900–1,000 but has not received 536–899, A is still waiting for byte 536. Therefore A sends acknowledgment number **536**.

Because TCP only acknowledges bytes up to the first missing byte, TCP provides **cumulative acknowledgments**.

### Initial Sequence Numbers

Both sides randomly choose an initial sequence number. This minimizes the possibility that a segment still present in the network from an earlier terminated connection between the same hosts and ports is mistaken for a valid segment in a later connection.

The original notes also contain: “the sequence number must have some data, even though it is not required.”

## Round-Trip Time Estimation and Timeout

**SampleRTT:** amount of time between sending a segment (passing it to IP) and receiving an acknowledgment for it.

TCP implementations do not measure SampleRTT for every transmitted segment. They take one SampleRTT measurement at a time, approximately once every RTT. TCP never computes SampleRTT for a retransmitted segment; it measures SampleRTT only for segments transmitted once.

SampleRTT fluctuates due to router congestion and varying end-system load. TCP therefore maintains an average called **EstimatedRTT**.

### EstimatedRTT

```
EstimatedRTT = (1 – alpha) • EstimatedRTT + alpha • SampleRTT
```

Recommended:

```
alpha = 0.125
EstimatedRTT = 0.875 • EstimatedRTT + 0.125 • SampleRTT
```

This is an **exponential weighted moving average (EWMA)**.

### DevRTT

DevRTT measures how much SampleRTT deviates from EstimatedRTT.

```
DevRTT = (1 – β) • DevRTT + β • |SampleRTT – EstimatedRTT|
```

Recommended:

```
β = 0.25
```

DevRTT is an EWMA of the difference between SampleRTT and EstimatedRTT. Little fluctuation gives small DevRTT; large fluctuation gives large DevRTT.

### TimeoutInterval

```
TimeoutInterval = EstimatedRTT + 4 • DevRTT
```

Initial recommended value in the notes: **1 second**.

When a timeout occurs, TimeoutInterval is doubled to avoid premature timeout for a subsequent segment that may soon be acknowledged. Once a segment is received and EstimatedRTT is updated, TimeoutInterval is again computed using the formula above.

## Reliable Data Transfer

**Original image references:** `images/image18.png`, `images/image30.png`, `images/image7.png`

## Flow Control

The original notes identify this material as taken from [**https://hpbn.co/building-blocks-of-tcp/**](https://hpbn.co/building-blocks-of-tcp/).

Flow control prevents the sender from overwhelming the receiver with data it may not be able to process. The receiver may be busy, under heavy load, or may only be willing to allocate a fixed amount of buffer space.

Each side of the TCP connection advertises its own **receive window (`rwnd`)**, communicating the size of available buffer space for incoming data.

When the connection is established, both sides initialize `rwnd` using system defaults. A typical Web page streams most data from server to client, making the client's window the likely bottleneck. For a large upload, such as an image or video upload, the server receive window may become the limiting factor.

If one side cannot keep up, it can advertise a smaller window. If the window reaches zero, it signals that no more data should be sent until existing buffer data is cleared by the application layer. Each ACK carries the latest `rwnd`, allowing both sides to dynamically adjust data flow according to capacity and processing speed.

**Original image reference:** `images/image26.png`

### Zero-Window Problem

Suppose Host B's receive buffer becomes full, so `rwnd = 0`. B advertises `rwnd = 0` to A and has nothing to send to A.

As B's application empties the buffer, TCP does not automatically send a new segment with the new `rwnd` value because TCP sends a segment only when it has data to send or an acknowledgment to send. Host A could therefore remain blocked and unaware that space has opened.

To solve this, TCP requires Host A to continue sending segments containing one data byte when B's receive window is zero. B acknowledges these segments. Eventually the buffer begins to empty and acknowledgments contain a nonzero `rwnd`.

## TCP Connection Management — Three-Way Handshake

**Original image reference:** `images/image2.png`

Suppose a client process wants to initiate a connection with a server process.

### Step 1 — SYN

Client-side TCP sends a special TCP segment containing no application-layer data. The **SYN bit is set to 1**, so it is a SYN segment. The client randomly chooses an initial sequence number, `client_isn`, and puts it in the sequence-number field. The segment is encapsulated within an IP datagram and sent to the server.

### Step 2 — SYNACK

When the SYN arrives, the server allocates TCP buffers and variables and sends a connection-granted segment. It contains no application-layer data. Important fields:

- SYN = 1
- acknowledgment field = `client_isn + 1`
- sequence number = server's randomly chosen `server_isn`

This is the **SYNACK segment**.

### Step 3 — ACK

After receiving SYNACK, the client allocates buffers and variables and sends a segment acknowledging the server's connection-granted segment.

- acknowledgment field = `server_isn + 1`
- SYN = 0
- third segment may carry client-to-server data

After these three steps, both hosts can send data. Future segments have SYN = 0. This is the **three-way handshake**.

## Principles of Congestion Control

### Approaches

**End-to-end congestion control:** network layer provides no explicit support to the transport layer for congestion control. TCP uses this because underlying IP does not provide feedback.

**Network-assisted congestion control:** network-layer components such as routers provide explicit feedback regarding congestion state to the sender.

The notes also reference **P294**.

## TCP Congestion Control

`cwnd` = congestion window.

```
LastByteSent – LastByteAcked <= min{cwnd, rwnd}
```

### Slow Start

**TODO in the original notes.**

## Recap Before Interview

### Congestion

Heavy traffic that slows down network response time.

### Effects of Congestion

- As delay increases, performance decreases.
- If delay increases, retransmission occurs, making the situation worse.

### Congestion Control Algorithms

#### Leaky Bucket Algorithm

**Original image reference:** `images/image10.png`

#### Token Bucket

A different but equivalent formulation is to imagine a network as a bucket being filled. The tap runs at rate `R`, and the bucket has capacity `B`. To send a packet, tokens/water must be taken out of the bucket.

```
                Tap
                | | |
                | | |     Rate R
                | | |
                |          |   Capacity B
Take out water/tokens |   Bucket     |
                      |              |
                      |______________|
```

### TCP Congestion Policy

1. **Slow Start Phase:** starts slowly; increment is exponential to threshold.
2. **Congestion Avoidance Phase:** after reaching the threshold, increment is by 1.
3. **Congestion Detection Phase:** sender goes back to Slow Start phase or Congestion Avoidance phase.

### TCP 3-Way Handshake — Interview Recap

1. **SYN:** client wants to establish a connection and sends a segment with SYN, informing the server of the sequence number with which the client starts segments.
2. **SYN + ACK:** server responds with SYN-ACK. ACK signifies the response to the received segment; SYN signifies the sequence number with which the server is likely to start segments.
3. **ACK:** client acknowledges the server's response and both establish a reliable connection for actual data transfer.

---

# Network Layer

*Source: Kurose & Ross E6, P305–413*

## Forwarding and Routing

**Forwarding:** transfer of a packet from an incoming link to an outgoing link within a single router.

**Routing:** involves all of a network's routers; their collective interactions via routing protocols determine the paths packets take from source to destination.

## Recap Before Interview

- Routing — packets are routed from source to destination.
- IPv4
- IPv6
- ICMP — Internet Control Message Protocol

IP does not provide a mechanism for sending error and control messages. It depends on ICMP to provide error control.

ICMP messages listed in the notes:

- Source quench message
- Parameter problem
- Time exceeded message
- Destination unreachable

## OSPF

**Open Shortest Path First (OSPF):** a link-state routing protocol used to find the best path between the source and destination router using its own SPF algorithm.

Designated Router (DR) and Backup Designated Router (BDR) election takes place in broadcast or multi-access networks.

### DR/BDR Election Criteria

1. Router with the highest router priority is declared DR.
2. If there is a tie in router priority, the highest router is considered. First, the highest loopback address is considered. If no loopback is configured, the highest active IP address on the router interface is considered.

## RIP

**Routing Information Protocol (RIP):** dynamic routing protocol using hop count as a routing metric to find the best path between source and destination network. It is a distance-vector routing protocol.

The original notes state:

- Administrative Distance (AD) = **120**
- Works on the **application layer of the OSI model**
- Port number = **520**

### Hop Count

1. Hop count is the number of routers occurring between the source and destination network. The path with the lowest hop count is considered the best route and placed in the routing table.
2. Maximum hop count allowed for RIP = **15**. Hop count **16** is considered network unreachable.

---

# Data Link Layer

The main task of the data link layer is to transform a raw transmission facility into a line that appears to have no errors. This is accomplished by dividing the transmission into **data frames**.

---

# Physical Layer

The physical layer transmits raw bits (`0` or `1`) over the communication channel.

## Layer Topology

- Mesh
- Bus
- Ring
- Star

## Transmission Modes

- Simplex
- Half-duplex
- Full-duplex

---

# What Happens When `google.com` Is Typed Into the Browser?

The original notes contain this as a placement topic/question and point to:

[https://github.com/alex/what-happens-when](https://github.com/alex/what-happens-when)

**Important:** no additional explanation has been inserted here because the supplied notes only contain the question and reference.

---

# Ports

In computer networking, a **port** is a communication endpoint. Physical as well as wireless connections are terminated at ports of hardware devices. At the software level, within an operating system, a port is a logical construct that identifies a specific process or type of network service.

Ports are identified for each protocol and address combination by **16-bit unsigned numbers**, commonly known as port numbers.

The most common protocols using port numbers are **TCP** and **UDP**.

## Port Numbers Explicitly Present in the Notes

- HTTP — 80
- FTP — 21
- SMTP — 25
- POP3 — 110
- DNS — 53 (as stated in the supplied notes)
- SNMP — UDP 161/162
- HTTPS — 443
- RIP — 520

---

# Original Notes — Study / Reference Markers

- Kurose & Ross E6, top-down approach
- Application layer material includes source/reference pages and image references from the supplied notes.
- Transport layer source: P185–285, Kurose & Ross E6.
- Reliable Data Transfer: study Kurose & Ross E6 P204–230.
- Congestion-control causes/cost: Kurose & Ross E6 P259–265.
- Congestion control notes also reference P294.
- Flow-control content in the original notes is attributed to `https://hpbn.co/building-blocks-of-tcp/`.
- Protocol reference: Tanenbaum P465.
- The original notes include image references that are preserved by filename above where the supplied text identified them.
- Some original sections are explicitly marked **TODO**, including Slow Start and the structure of units of different layers.

## Credits from the Original Notes

Part of the supplied note is taken from **Kurose & Ross E6**, **GeeksforGeeks**, and [**hpbn.co**](http://hpbn.co).