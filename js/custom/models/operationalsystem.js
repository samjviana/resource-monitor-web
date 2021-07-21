/**
 * Representa um Sistema Operacional
 * @class
 */
export class OperationalSystem {
    /**
     * @constructs
     */
    constructor(uuid, name, version, build, manufacturer, architecture, serialKey, 
        serialNumber, status, installDate, language, country, codePage, bootDevice,
        systemPartition, installPath
    ) {
        this.uuid = uuid;
        this.name = name;
        this.version = version;
        this.build = build;
        this.manufacturer = manufacturer;
        this.architecture = architecture;
        this.serialKey = serialKey;
        this.serialNumber = serialNumber;
        this.status = status;
        this.installDate = installDate;
        this.language = language;
        this.country = country;
        this.codePage = codePage;
        this.bootDevice = bootDevice;
        this.systemPartition = systemPartition;
        this.installPath = installPath;
    }
}