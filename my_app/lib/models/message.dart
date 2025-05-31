class Message {
  final String? id; // ✅ added
  final String senderId;
  final String senderType;
  final String message;
  final String? fileUrl;
  final String? fileType;
  final bool read;

  Message({
    this.id,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.fileUrl,
    this.fileType,
    required this.read,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['_id'], // ✅ map MongoDB _id
      senderId: json['senderId'],
      senderType: json['senderType'],
      message: json['message'] ?? '',
      fileUrl: json['fileUrl'],
      fileType: json['fileType'],
      read: json['read'] ?? false,
    );
  }
}
