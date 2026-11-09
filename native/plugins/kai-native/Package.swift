// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "KaiNative",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "KaiNative",
            targets: ["KaiNativePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "KaiNativePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/KaiNativePlugin",
            linkerSettings: [
                .linkedFramework("FamilyControls"),
                .linkedFramework("ManagedSettings"),
                .linkedFramework("Speech"),
                .linkedFramework("AVFoundation")
            ])
    ]
)
